import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasAnyRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const attempt = await prisma.translationAttempt.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: {
          include: {
            cefrLevel: true,
            genre: true,
            sourceTextVersion: {
              include: { sourceText: true },
            },
          },
        },
        versions: {
          include: {
            feedbackRuns: {
              include: {
                errorAnnotations: {
                  orderBy: { createdAt: "asc" },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { versionNumber: "asc" },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy bài làm" } },
        { status: 404 }
      );
    }

    // Authorization check
    const isOwner = attempt.userId === auth.user.id;
    const isStaff = hasAnyRole(auth.user, [Role.TEACHER, Role.ADMIN, Role.RESEARCHER]);

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Bạn không có quyền xem bài làm này" } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { attempt },
    });
  } catch (error) {
    console.error("Get attempt error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải thông tin bài làm" } },
      { status: 500 }
    );
  }
}
