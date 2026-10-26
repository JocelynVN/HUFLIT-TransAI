import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireRole([Role.RESEARCHER, Role.ADMIN]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const cefr = searchParams.get("cefr");
    const pseudonymize = searchParams.get("pseudonymize") !== "false"; // default true for research ethics

    const attempts = await prisma.translationAttempt.findMany({
      where: {
        status: { in: ["SUBMITTED", "FEEDBACK_READY", "POST_EDITING", "COMPLETED"] },
        ...(cefr ? { task: { cefrLevel: { code: cefr } } } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            participants: { select: { pseudonymCode: true, studyId: true } },
          },
        },
        task: {
          include: {
            cefrLevel: true,
            genre: true,
            sourceTextVersion: true,
          },
        },
        versions: {
          include: {
            feedbackRuns: {
              include: {
                errorAnnotations: true,
                promptVersion: { select: { version: true } },
                rubricVersion: { select: { version: true } },
              },
            },
          },
          orderBy: { versionNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const corpus = attempts.map((att) => {
      const originalVersion = att.versions.find((v) => v.versionNumber === 1);
      const postEditVersion = att.versions.find((v) => v.versionNumber > 1);
      const feedback = originalVersion?.feedbackRuns[0];

      const participantCode =
        att.user.participants[0]?.pseudonymCode || `P-${att.userId.substring(0, 8)}`;

      return {
        attemptId: att.id,
        participantIdentifier: pseudonymize ? participantCode : att.user.name,
        participantEmail: pseudonymize ? undefined : att.user.email,
        taskTitle: att.task.title,
        sourceLanguage: att.task.sourceLanguage,
        targetLanguage: att.task.targetLanguage,
        cefrLevel: att.task.cefrLevel.code,
        genre: att.task.genre?.name || "General",
        sourceText: att.task.sourceTextVersion.body,
        originalTranslation: originalVersion?.text || "",
        postEditedTranslation: postEditVersion?.text || null,
        aiScore: feedback?.estimatedScore ?? null,
        promptVersion: feedback?.promptVersion?.version || "v1.0",
        rubricVersion: feedback?.rubricVersion?.version || "v1.0",
        errorCount: feedback?.errorAnnotations.length || 0,
        errors: feedback?.errorAnnotations.map((e) => ({
          category: e.category,
          subtype: e.subtype,
          severity: e.severity,
          targetQuote: e.targetQuote,
          explanation: e.explanation,
          suggestion: e.suggestion,
        })) || [],
      };
    });

    return NextResponse.json({
      success: true,
      data: { corpus, count: corpus.length },
    });
  } catch (error) {
    console.error("Fetch corpus error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Lỗi tải Translation Corpus" } },
      { status: 500 }
    );
  }
}
