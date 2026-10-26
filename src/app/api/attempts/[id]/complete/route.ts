import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { AttemptStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
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
        { success: false, error: { code: "FORBIDDEN", message: "Bạn không có quyền cập nhật bài làm này" } },
        { status: 403 }
      );
    }

    const updated = await prisma.translationAttempt.update({
      where: { id: params.id },
      data: {
        status: AttemptStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "COMPLETE_ATTEMPT",
      resourceType: "TranslationAttempt",
      resourceId: attempt.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        attempt: updated,
      },
    });
  } catch (error) {
    console.error("Complete attempt error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi hoàn thành bài làm" } },
      { status: 500 }
    );
  }
}
