import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { AttemptStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const createAttemptSchema = z.object({
  taskId: z.string().uuid("ID bài tập không hợp lệ"),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = createAttemptSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const { taskId } = result.data;

    // Check task existence
    const task = await prisma.translationTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: { code: "TASK_NOT_FOUND", message: "Không tìm thấy bài tập dịch." } },
        { status: 404 }
      );
    }

    // Check if there is an unfinished draft attempt
    const existingDraft = await prisma.translationAttempt.findFirst({
      where: {
        userId: auth.user.id,
        taskId: task.id,
        status: AttemptStatus.DRAFT,
      },
    });

    if (existingDraft) {
      return NextResponse.json({
        success: true,
        data: { attempt: existingDraft, isResumed: true },
      });
    }

    // Create fresh attempt
    const attempt = await prisma.translationAttempt.create({
      data: {
        userId: auth.user.id,
        taskId: task.id,
        status: AttemptStatus.DRAFT,
        startedAt: new Date(),
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "START_ATTEMPT",
      resourceType: "TranslationAttempt",
      resourceId: attempt.id,
      metadata: { taskId },
    });

    return NextResponse.json(
      { success: true, data: { attempt, isResumed: false } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create attempt error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi khởi tạo bài làm" } },
      { status: 500 }
    );
  }
}
