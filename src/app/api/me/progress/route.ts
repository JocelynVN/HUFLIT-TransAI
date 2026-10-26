import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { AttemptStatus } from "@prisma/client";

export async function GET() {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const attempts = await prisma.translationAttempt.findMany({
      where: { userId: auth.user.id },
      include: {
        task: {
          include: { cefrLevel: true, genre: true },
        },
        versions: {
          include: {
            feedbackRuns: {
              include: {
                errorAnnotations: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { versionNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalAttempts = attempts.length;
    const submittedAttempts = attempts.filter((a) => a.status !== AttemptStatus.DRAFT);
    const completedAttempts = attempts.filter((a) => a.status === AttemptStatus.COMPLETED);
    const inProgressAttempts = attempts.filter((a) => a.status === AttemptStatus.DRAFT || a.status === AttemptStatus.POST_EDITING);

    // CEFR distribution
    const cefrCounts: Record<string, number> = { B1: 0, B2: 0, C1: 0 };
    submittedAttempts.forEach((a) => {
      const code = a.task.cefrLevel.code;
      if (cefrCounts[code] !== undefined) cefrCounts[code]++;
      else cefrCounts[code] = 1;
    });

    // Error aggregation by category and severity
    const errorCategoryCounts: Record<string, number> = {
      ACCURACY: 0,
      FLUENCY: 0,
      TERMINOLOGY: 0,
      STYLE: 0,
    };

    const errorSeverityCounts: Record<string, number> = {
      MINOR: 0,
      MAJOR: 0,
      CRITICAL: 0,
    };

    let totalScoreSum = 0;
    let scoredRunsCount = 0;
    let scoreImprovements: { originalScore: number; postEditScore: number; improvement: number }[] = [];

    submittedAttempts.forEach((att) => {
      // Version 1 (ORIGINAL)
      const v1 = att.versions.find((v) => v.versionNumber === 1);
      const v1Feedback = v1?.feedbackRuns[0];

      if (v1Feedback) {
        if (v1Feedback.estimatedScore !== null) {
          totalScoreSum += v1Feedback.estimatedScore;
          scoredRunsCount++;
        }

        v1Feedback.errorAnnotations.forEach((anno) => {
          if (errorCategoryCounts[anno.category] !== undefined) {
            errorCategoryCounts[anno.category]++;
          }
          if (errorSeverityCounts[anno.severity] !== undefined) {
            errorSeverityCounts[anno.severity]++;
          }
        });

        // Check if there are post-edit revisions with feedback
        const postEditVersions = att.versions.filter((v) => v.versionNumber > 1);
        const lastPostEdit = postEditVersions[postEditVersions.length - 1];
        const lastPostEditFeedback = lastPostEdit?.feedbackRuns[0];

        if (
          v1Feedback.estimatedScore !== null &&
          lastPostEditFeedback?.estimatedScore !== null &&
          lastPostEditFeedback?.estimatedScore !== undefined
        ) {
          scoreImprovements.push({
            originalScore: v1Feedback.estimatedScore,
            postEditScore: lastPostEditFeedback.estimatedScore,
            improvement: Math.round((lastPostEditFeedback.estimatedScore - v1Feedback.estimatedScore) * 10) / 10,
          });
        }
      }
    });

    const averageScore =
      scoredRunsCount > 0 ? Math.round((totalScoreSum / scoredRunsCount) * 10) / 10 : null;

    const recentTranslations = submittedAttempts.slice(0, 5).map((att) => {
      const v1 = att.versions[0];
      const feedback = v1?.feedbackRuns[0];
      return {
        id: att.id,
        taskId: att.taskId,
        title: att.task.title,
        cefr: att.task.cefrLevel.code,
        status: att.status,
        submittedAt: att.submittedAt,
        score: feedback?.estimatedScore ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAttempts,
          submittedCount: submittedAttempts.length,
          completedCount: completedAttempts.length,
          inProgressCount: inProgressAttempts.length,
          averageScore,
        },
        cefrDistribution: Object.entries(cefrCounts).map(([level, count]) => ({ level, count })),
        errorDistribution: Object.entries(errorCategoryCounts).map(([category, count]) => ({ category, count })),
        severityDistribution: Object.entries(errorSeverityCounts).map(([severity, count]) => ({ severity, count })),
        recentTranslations,
        scoreImprovements,
        hasSufficientData: submittedAttempts.length > 0,
      },
    });
  } catch (error) {
    console.error("Fetch progress error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tổng hợp tiến độ học tập" } },
      { status: 500 }
    );
  }
}
