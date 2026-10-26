import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { AttemptStatus, VersionKind } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const revisionSchema = z.object({
  text: z.string().min(1, "Nội dung chỉnh sửa không được để trống").trim(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = revisionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const { text } = result.data;

    const attempt = await prisma.translationAttempt.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
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
        { success: false, error: { code: "FORBIDDEN", message: "Bạn không có quyền chỉnh sửa bài làm này" } },
        { status: 403 }
      );
    }

    const currentLatest = attempt.versions[0];
    const nextVersionNumber = (currentLatest?.versionNumber || 1) + 1;
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Create new revision version
    const revision = await prisma.translationVersion.create({
      data: {
        attemptId: attempt.id,
        versionNumber: nextVersionNumber,
        kind: VersionKind.POST_EDIT,
        text,
        wordCount,
      },
    });

    await prisma.translationAttempt.update({
      where: { id: attempt.id },
      data: {
        status: AttemptStatus.POST_EDITING,
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "SAVE_POST_EDIT_REVISION",
      resourceType: "TranslationVersion",
      resourceId: revision.id,
      metadata: { attemptId: attempt.id, versionNumber: nextVersionNumber },
    });

    return NextResponse.json({
      success: true,
      data: { revision },
    });
  } catch (error) {
    console.error("Save revision error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi lưu bản hậu hiệu đính" } },
      { status: 500 }
    );
  }
}
