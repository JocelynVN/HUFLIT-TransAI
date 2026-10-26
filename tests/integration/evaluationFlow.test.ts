import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";
import { runEvaluationJob } from "@/lib/queue/evaluationQueue";
import { AttemptStatus, VersionKind } from "@prisma/client";

describe("Translation Practice & Evaluation Lifecycle (Integration)", () => {
  it("should process an attempt from draft to submitted, AI evaluation, and post-editing", async () => {
    // 1. Get seeded student and a task
    const student = await prisma.user.findUnique({
      where: { email: "student@huflit.edu.vn" },
    });
    expect(student).not.toBeNull();

    const task = await prisma.translationTask.findFirst({
      where: { sourceLanguage: "en", targetLanguage: "vi" },
    });
    expect(task).not.toBeNull();

    // 2. Create Attempt
    const attempt = await prisma.translationAttempt.create({
      data: {
        userId: student!.id,
        taskId: task!.id,
        status: AttemptStatus.DRAFT,
        draftText: "Đà Nẵng đã trở thành một thành phố ven biển...",
      },
    });
    expect(attempt.status).toBe(AttemptStatus.DRAFT);

    // 3. Submit translation -> create Version 1 (ORIGINAL)
    const originalText =
      "Đà Nẵng đã trở thành một thành phố ven biển năng động. Du khách đặc biệt thích thú với Cầu Vàng bồng bềnh trên các đám mây.";
    const version1 = await prisma.translationVersion.create({
      data: {
        attemptId: attempt.id,
        versionNumber: 1,
        kind: VersionKind.ORIGINAL,
        text: originalText,
        wordCount: originalText.split(/\s+/).length,
      },
    });

    await prisma.translationAttempt.update({
      where: { id: attempt.id },
      data: {
        status: AttemptStatus.FEEDBACK_PENDING,
        submittedAt: new Date(),
      },
    });

    // 4. Run AI Evaluation
    const feedbackRunId = await runEvaluationJob(version1.id);
    expect(feedbackRunId).toBeDefined();

    // Verify FeedbackRun & Annotations
    const feedback = await prisma.feedbackRun.findUnique({
      where: { id: feedbackRunId },
      include: { errorAnnotations: true },
    });
    expect(feedback).not.toBeNull();
    expect(feedback?.status).toBe("READY");
    expect(feedback?.estimatedScore).toBeGreaterThanOrEqual(0);
    expect(feedback?.estimatedScore).toBeLessThanOrEqual(100);

    // Check that attempt transitioned to FEEDBACK_READY
    const updatedAttempt = await prisma.translationAttempt.findUnique({
      where: { id: attempt.id },
    });
    expect(updatedAttempt?.status).toBe(AttemptStatus.FEEDBACK_READY);

    // 5. Post-editing: Create Revision (Version 2)
    const revisedText =
      "Đà Nẵng đã trở thành một trong những thành phố biển năng động bậc nhất Việt Nam. Du khách đặc biệt say đắm cây Cầu Vàng bồng bềnh giữa biển mây.";
    const version2 = await prisma.translationVersion.create({
      data: {
        attemptId: attempt.id,
        versionNumber: 2,
        kind: VersionKind.POST_EDIT,
        text: revisedText,
        wordCount: revisedText.split(/\s+/).length,
      },
    });

    await prisma.translationAttempt.update({
      where: { id: attempt.id },
      data: { status: AttemptStatus.POST_EDITING },
    });

    expect(version2.versionNumber).toBe(2);
    expect(version2.kind).toBe(VersionKind.POST_EDIT);

    // 6. Complete Attempt
    const completed = await prisma.translationAttempt.update({
      where: { id: attempt.id },
      data: {
        status: AttemptStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
    expect(completed.status).toBe(AttemptStatus.COMPLETED);

    // Cleanup test attempt
    await prisma.translationAttempt.delete({ where: { id: attempt.id } });
  });
});
