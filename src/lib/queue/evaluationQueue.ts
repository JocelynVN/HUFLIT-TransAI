import { prisma } from "../prisma";
import { getAIProvider } from "../ai";
import { matchSpan } from "../spanMatcher";
import { AttemptStatus, FeedbackRunStatus, ConfigStatus } from "@prisma/client";

/**
 * Runs the AI evaluation job for a specific TranslationVersion.
 * Can be run asynchronously or directly via queue.
 */
export async function runEvaluationJob(translationVersionId: string): Promise<string> {
  const version = await prisma.translationVersion.findUnique({
    where: { id: translationVersionId },
    include: {
      attempt: {
        include: {
          task: {
            include: {
              sourceTextVersion: true,
              cefrLevel: true,
              genre: true,
            },
          },
        },
      },
    },
  });

  if (!version) {
    throw new Error(`TranslationVersion not found: ${translationVersionId}`);
  }

  const { attempt } = version;
  const { task } = attempt;

  // Retrieve active prompt and rubric
  const activePrompt = await prisma.promptVersion.findFirst({
    where: { status: ConfigStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
  });

  const activeRubric = await prisma.mQMRubricVersion.findFirst({
    where: { status: ConfigStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
  });

  const provider = getAIProvider();

  // Create initial FeedbackRun
  const feedbackRun = await prisma.feedbackRun.create({
    data: {
      translationVersionId: version.id,
      status: FeedbackRunStatus.PROCESSING,
      provider: provider.name,
      modelId: process.env.AI_MODEL_ID || "default-mqm-v1",
      promptVersionId: activePrompt?.id,
      rubricVersionId: activeRubric?.id,
    },
  });

  try {
    const result = await provider.evaluateTranslation({
      sourceLanguage: task.sourceLanguage,
      targetLanguage: task.targetLanguage,
      cefrLevel: task.cefrLevel.code,
      genre: task.genre?.name || "General",
      instructions: task.instructions || undefined,
      sourceText: task.sourceTextVersion.body,
      studentTranslation: version.text,
      systemInstruction: activePrompt?.systemInstruction,
    });

    // Process and match spans for each error
    const annotationsData = result.errors.map((err) => {
      const match = matchSpan(version.text, err.targetQuote, err.occurrenceIndex || 0);

      return {
        feedbackRunId: feedbackRun.id,
        category: err.category,
        subtype: err.subtype,
        severity: err.severity,
        targetQuote: err.targetQuote,
        occurrenceIndex: err.occurrenceIndex || 0,
        startOffset: match.startOffset,
        endOffset: match.endOffset,
        anchorStatus: match.anchorStatus,
        sourceEvidence: err.sourceEvidence || null,
        explanation: err.explanation,
        suggestion: err.suggestion || null,
      };
    });

    // Save annotations in database
    if (annotationsData.length > 0) {
      await prisma.errorAnnotation.createMany({
        data: annotationsData,
      });
    }

    // Update FeedbackRun to READY
    await prisma.feedbackRun.update({
      where: { id: feedbackRun.id },
      data: {
        status: FeedbackRunStatus.READY,
        overallComment: result.overallComment,
        strengths: result.strengths as any,
        learningTips: result.learningTips as any,
        suggestedTranslations: result.suggestedTranslations as any,
        estimatedScore: result.estimatedScore,
        tokenUsage: result.tokenUsage.totalTokens,
        estimatedCost: result.estimatedCost,
        completedAt: new Date(),
      },
    });

    // Record AI Usage
    await prisma.aIUsageRecord.create({
      data: {
        userId: attempt.userId,
        feedbackRunId: feedbackRun.id,
        provider: provider.name,
        modelId: process.env.AI_MODEL_ID || "default-mqm-v1",
        promptTokens: result.tokenUsage.promptTokens,
        completionTokens: result.tokenUsage.completionTokens,
        totalTokens: result.tokenUsage.totalTokens,
        estimatedCost: result.estimatedCost,
      },
    });

    // Transition Attempt status to FEEDBACK_READY
    await prisma.translationAttempt.update({
      where: { id: attempt.id },
      data: {
        status: AttemptStatus.FEEDBACK_READY,
      },
    });

    return feedbackRun.id;
  } catch (error: any) {
    console.error("Evaluation job failed:", error);

    await prisma.feedbackRun.update({
      where: { id: feedbackRun.id },
      data: {
        status: FeedbackRunStatus.FAILED,
        errorMessage: error?.message || "Lỗi xử lý đánh giá bản dịch",
      },
    });

    await prisma.translationAttempt.update({
      where: { id: attempt.id },
      data: {
        status: AttemptStatus.FEEDBACK_FAILED,
      },
    });

    throw error;
  }
}
