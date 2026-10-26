import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, hasAnyRole } from "@/lib/rbac";
import { Role } from "@prisma/client";
import { getSUSGrade } from "@/lib/sus";

export async function GET() {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const isResearcher = hasAnyRole(auth.user, [Role.RESEARCHER, Role.ADMIN]);

    // Find SUS survey
    const survey = await prisma.survey.findFirst({
      where: { type: "SUS" },
      include: {
        responses: {
          include: {
            participant: { select: { pseudonymCode: true, userId: true } },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!survey) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Chưa cấu hình khảo sát SUS" } },
        { status: 404 }
      );
    }

    const scores = survey.responses
      .map((r) => r.calculatedScore)
      .filter((s): s is number => s !== null);

    const meanScore =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null;

    const grade = meanScore !== null ? getSUSGrade(meanScore) : null;

    return NextResponse.json({
      success: true,
      data: {
        survey: {
          id: survey.id,
          title: survey.title,
          questions: survey.questions,
        },
        analytics: {
          totalResponses: scores.length,
          meanScore,
          grade,
        },
        responses: isResearcher
          ? survey.responses.map((r) => ({
              id: r.id,
              pseudonymCode: r.participant.pseudonymCode,
              calculatedScore: r.calculatedScore,
              answers: r.answers,
              submittedAt: r.submittedAt,
            }))
          : [],
      },
    });
  } catch (error) {
    console.error("Fetch SUS error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải khảo sát SUS" } },
      { status: 500 }
    );
  }
}
