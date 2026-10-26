import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

export async function GET() {
  const auth = await requireRole([Role.RESEARCHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const attempts = await prisma.translationAttempt.findMany({
      where: {
        status: { in: ["FEEDBACK_READY", "POST_EDITING", "COMPLETED"] },
      },
      include: {
        task: { include: { cefrLevel: true, sourceTextVersion: true } },
        user: {
          include: {
            participants: {
              include: {
                groupMemberships: {
                  include: { group: true },
                },
              },
            },
          },
        },
        versions: {
          include: { feedbackRuns: true },
          orderBy: { versionNumber: "asc" },
        },
      },
    });

    let aiGroupScores: number[] = [];
    let controlGroupScores: number[] = [];
    let prePostPairs: { original: number; postEdit: number; diff: number }[] = [];

    attempts.forEach((att) => {
      const v1 = att.versions.find((v) => v.versionNumber === 1);
      const v1Score = v1?.feedbackRuns[0]?.estimatedScore;

      const postEditVersions = att.versions.filter((v) => v.versionNumber > 1);
      const latestPostEdit = postEditVersions[postEditVersions.length - 1];
      const postEditScore = latestPostEdit?.feedbackRuns[0]?.estimatedScore;

      // Group classification
      const participant = att.user.participants[0];
      const groupCondition = participant?.groupMemberships[0]?.group.condition || "AI_ASSISTED";

      if (v1Score !== null && v1Score !== undefined) {
        if (groupCondition === "AI_ASSISTED") {
          aiGroupScores.push(v1Score);
        } else {
          controlGroupScores.push(v1Score);
        }
      }

      if (
        v1Score !== null &&
        v1Score !== undefined &&
        postEditScore !== null &&
        postEditScore !== undefined
      ) {
        prePostPairs.push({
          original: v1Score,
          postEdit: postEditScore,
          diff: Math.round((postEditScore - v1Score) * 10) / 10,
        });
      }
    });

    const calcMean = (arr: number[]) =>
      arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

    const meanAIGroup = calcMean(aiGroupScores);
    const meanControlGroup = calcMean(controlGroupScores);
    const meanImprovement = calcMean(prePostPairs.map((p) => p.diff));

    return NextResponse.json({
      success: true,
      data: {
        groupsComparison: {
          aiAssisted: {
            sampleSize: aiGroupScores.length,
            meanScore: meanAIGroup,
          },
          control: {
            sampleSize: controlGroupScores.length,
            meanScore: meanControlGroup,
          },
        },
        postEditingEffectiveness: {
          pairedCount: prePostPairs.length,
          meanImprovement,
          prePostPairs,
        },
      },
    });
  } catch (error) {
    console.error("Comparison analysis error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi phân tích đối sánh nghiên cứu" } },
      { status: 500 }
    );
  }
}
