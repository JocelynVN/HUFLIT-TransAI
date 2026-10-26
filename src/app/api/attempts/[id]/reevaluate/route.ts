import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { runEvaluationJob } from "@/lib/queue/evaluationQueue";
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
      include: {
        task: true,
        versions: {
          include: { feedbackRuns: true },
          orderBy: { versionNumber: "desc" },
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
        { success: false, error: { code: "FORBIDDEN", message: "Bạn không có quyền yêu cầu đánh giá lại bài này" } },
        { status: 403 }
      );
    }

    const latestVersion = attempt.versions[0];
    if (!latestVersion) {
      return NextResponse.json(
        { success: false, error: { code: "NO_VERSION", message: "Chưa có bản dịch nào để đánh giá" } },
        { status: 400 }
      );
    }

    // Count how many evaluations have been executed on this attempt beyond original
    const totalRuns = attempt.versions.reduce((acc, v) => acc + v.feedbackRuns.length, 0);
    const maxAllowed = attempt.task.maxReevaluations + 1; // 1 initial + max re-evals

    if (totalRuns >= maxAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MAX_REEVALUATIONS_EXCEEDED",
            message: `Bạn đã đạt giới hạn tối đa ${attempt.task.maxReevaluations} lần yêu cầu AI đánh giá lại cho bài này.`,
          },
        },
        { status: 400 }
      );
    }

    const feedbackRunId = await runEvaluationJob(latestVersion.id);

    await logAudit({
      actorId: auth.user.id,
      action: "REEVALUATE_TRANSLATION",
      resourceType: "FeedbackRun",
      resourceId: feedbackRunId,
      metadata: { attemptId: attempt.id, versionId: latestVersion.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        feedbackRunId,
        versionId: latestVersion.id,
        versionNumber: latestVersion.versionNumber,
      },
    });
  } catch (error) {
    console.error("Re-evaluation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi đánh giá lại bản dịch" } },
      { status: 500 }
    );
  }
}
