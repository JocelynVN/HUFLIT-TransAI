import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { AttemptStatus, VersionKind } from "@prisma/client";
import { runEvaluationJob } from "@/lib/queue/evaluationQueue";
import { logAudit } from "@/lib/audit";

const submitSchema = z.object({
  text: z.string().min(1, "Bản dịch không được để trống").trim(),
  durationSeconds: z.number().int().min(0).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = submitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const { text, durationSeconds } = result.data;

    const attempt = await prisma.translationAttempt.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          where: { kind: VersionKind.ORIGINAL },
          take: 1,
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy bài làm" } },
        { status: 404 }
      );
    }

    if (attempt.userId !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Bạn không có quyền nộp bài làm này" } },
        { status: 403 }
      );
    }

    // Idempotency check: if an ORIGINAL version already exists, do NOT overwrite it
    if (attempt.versions.length > 0) {
      const originalVersion = attempt.versions[0];
      return NextResponse.json({
        success: true,
        data: {
          attempt: {
            id: attempt.id,
            status: attempt.status,
          },
          version: originalVersion,
          message: "Bài dịch ban đầu đã được lưu bất biến.",
        },
      });
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Create immutable Original Translation (Version 1)
    const version = await prisma.translationVersion.create({
      data: {
        attemptId: attempt.id,
        versionNumber: 1,
        kind: VersionKind.ORIGINAL,
        text,
        wordCount,
      },
    });

    // Update Attempt status
    const updatedAttempt = await prisma.translationAttempt.update({
      where: { id: attempt.id },
      data: {
        status: AttemptStatus.FEEDBACK_PENDING,
        submittedAt: new Date(),
        durationSeconds: durationSeconds ?? attempt.durationSeconds,
        draftText: null, // clear draft
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "SUBMIT_TRANSLATION",
      resourceType: "TranslationAttempt",
      resourceId: attempt.id,
      metadata: { versionId: version.id, wordCount },
    });

    // Trigger AI evaluation
    try {
      await runEvaluationJob(version.id);
    } catch (evalErr) {
      console.error("Async evaluation triggered error:", evalErr);
      // Even if AI job fails, the version remains safely submitted, attempt status is FEEDBACK_FAILED
    }

    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          id: updatedAttempt.id,
          status: AttemptStatus.FEEDBACK_READY,
        },
        version,
      },
    });
  } catch (error) {
    console.error("Submit translation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi nộp bài dịch" } },
      { status: 500 }
    );
  }
}
