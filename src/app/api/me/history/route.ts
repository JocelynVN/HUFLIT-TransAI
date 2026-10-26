import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET() {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const attempts = await prisma.translationAttempt.findMany({
      where: { userId: auth.user.id },
      include: {
        task: {
          include: {
            cefrLevel: true,
            genre: true,
          },
        },
        versions: {
          include: {
            feedbackRuns: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { versionNumber: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const historyItems = attempts.map((att) => {
      const latestVersion = att.versions[0] || null;
      const latestFeedback = latestVersion?.feedbackRuns[0] || null;

      return {
        id: att.id,
        taskId: att.taskId,
        taskTitle: att.task.title,
        cefrLevel: att.task.cefrLevel.code,
        direction: `${att.task.sourceLanguage.toUpperCase()} → ${att.task.targetLanguage.toUpperCase()}`,
        genre: att.task.genre?.name || "Khác",
        status: att.status,
        startedAt: att.startedAt,
        submittedAt: att.submittedAt,
        completedAt: att.completedAt,
        durationSeconds: att.durationSeconds,
        versionsCount: att.versions.length,
        latestScore: latestFeedback?.estimatedScore ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data: { history: historyItems },
    });
  } catch (error) {
    console.error("Fetch student history error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải lịch sử bài dịch" } },
      { status: 500 }
    );
  }
}
