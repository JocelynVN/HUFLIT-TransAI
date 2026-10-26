import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { AttemptStatus } from "@prisma/client";

const draftSchema = z.object({
  draftText: z.string(),
  durationSeconds: z.number().int().min(0).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = draftSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const attempt = await prisma.translationAttempt.findUnique({
      where: { id: params.id },
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

    if (attempt.status !== AttemptStatus.DRAFT) {
      return NextResponse.json(
        { success: false, error: { code: "ATTEMPT_ALREADY_SUBMITTED", message: "Bài làm đã được nộp, không thể lưu nháp" } },
        { status: 400 }
      );
    }

    const updated = await prisma.translationAttempt.update({
      where: { id: params.id },
      data: {
        draftText: result.data.draftText,
        durationSeconds: result.data.durationSeconds !== undefined ? result.data.durationSeconds : attempt.durationSeconds,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        savedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Autosave draft error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi lưu bản nháp" } },
      { status: 500 }
    );
  }
}
