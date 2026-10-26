import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const task = await prisma.translationTask.findUnique({
      where: { id: params.id },
      include: {
        cefrLevel: true,
        genre: true,
        sourceTextVersion: {
          include: { sourceText: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy bài tập dịch" } },
        { status: 404 }
      );
    }

    const sourceText = task.sourceTextVersion.body;
    const wordCount = sourceText.trim().split(/\s+/).filter(Boolean).length;

    // Check if user already has an active attempt for this task
    const activeAttempt = await prisma.translationAttempt.findFirst({
      where: {
        taskId: task.id,
        userId: auth.user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        task: {
          id: task.id,
          title: task.title,
          sourceLanguage: task.sourceLanguage,
          targetLanguage: task.targetLanguage,
          cefrLevel: task.cefrLevel.code,
          cefrName: task.cefrLevel.name,
          genre: task.genre?.name || "Khác",
          instructions: task.instructions,
          clipboardPolicy: task.clipboardPolicy,
          maxReevaluations: task.maxReevaluations,
          sourceText,
          wordCount,
          activeAttempt: activeAttempt
            ? {
                id: activeAttempt.id,
                status: activeAttempt.status,
                draftText: activeAttempt.draftText,
                latestVersionText: activeAttempt.versions[0]?.text || null,
                startedAt: activeAttempt.startedAt,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Get task detail error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải chi tiết bài tập" } },
      { status: 500 }
    );
  }
}
