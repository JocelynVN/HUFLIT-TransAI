import { Worker, Job } from "bullmq";
import { runEvaluationJob } from "../lib/queue/evaluationQueue";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

console.log("🚀 Starting standalone HUFLIT AI Evaluation Worker...");

const worker = new Worker(
  "translation-evaluation-queue",
  async (job: Job<{ translationVersionId: string }>) => {
    console.log(`[Worker] Processing evaluation job ${job.id} for version ${job.data.translationVersionId}`);
    try {
      const feedbackRunId = await runEvaluationJob(job.data.translationVersionId);
      console.log(`[Worker] Job ${job.id} completed. FeedbackRun: ${feedbackRunId}`);
      return { feedbackRunId };
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: {
      url: REDIS_URL,
    },
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} has completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});
