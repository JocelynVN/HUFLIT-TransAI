import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { calculateSUSScore } from "@/lib/sus";
import { logAudit } from "@/lib/audit";

const submitResponseSchema = z.object({
  answers: z.array(z.number().min(1).max(5)).length(10, "Cần trả lời đủ 10 câu hỏi SUS"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const result = submitResponseSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: result.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const { answers } = result.data;
    const calculatedScore = calculateSUSScore(answers);

    // Get or create participant for the student in the study
    const survey = await prisma.survey.findUnique({
      where: { id: params.id },
      include: { study: true },
    });

    if (!survey) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Khảo sát không tồn tại" } },
        { status: 404 }
      );
    }

    let participant = await prisma.researchParticipant.findFirst({
      where: {
        studyId: survey.studyId,
        userId: auth.user.id,
      },
    });

    if (!participant) {
      // Auto enroll with pseudonym
      const count = await prisma.researchParticipant.count({ where: { studyId: survey.studyId } });
      const pseudonymCode = `P-HUFLIT-${String(count + 1).padStart(3, "0")}`;

      participant = await prisma.researchParticipant.create({
        data: {
          studyId: survey.studyId,
          userId: auth.user.id,
          pseudonymCode,
          consentStatus: "CONSENTED",
          consentVersion: "v1.0",
          consentedAt: new Date(),
        },
      });
    }

    const surveyResponse = await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        participantId: participant.id,
        answers: answers as any,
        calculatedScore,
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "SUBMIT_SUS_SURVEY",
      resourceType: "SurveyResponse",
      resourceId: surveyResponse.id,
      metadata: { calculatedScore },
    });

    return NextResponse.json({
      success: true,
      data: {
        calculatedScore,
        message: "Cảm ơn bạn đã hoàn thành khảo sát System Usability Scale (SUS)!",
      },
    });
  } catch (error) {
    console.error("Submit SUS error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi gửi kết quả khảo sát" } },
      { status: 500 }
    );
  }
}
