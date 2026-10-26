export interface ScoringWeights {
  MINOR: number;
  MAJOR: number;
  CRITICAL: number;
  NEUTRAL: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  MINOR: 1,
  MAJOR: 5,
  CRITICAL: 10,
  NEUTRAL: 0,
};

export interface ErrorItemForScoring {
  severity: "MINOR" | "MAJOR" | "CRITICAL" | "NEUTRAL";
}

/**
 * Calculates the AI Estimated Quality Score (0 to 100) based on MQM error penalties
 * Formula: clamp(100 - 100 * weightedPenalty / max(sourceWordCount, 20), 0, 100)
 */
export function calculateMQMScore(
  errors: ErrorItemForScoring[],
  sourceWordCount: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  if (sourceWordCount <= 0) sourceWordCount = 20;

  const totalWeightedPenalty = errors.reduce((acc, err) => {
    const w = weights[err.severity] ?? 0;
    return acc + w;
  }, 0);

  const baselineWords = Math.max(sourceWordCount, 20);
  const rawScore = 100 - (100 * totalWeightedPenalty) / baselineWords;

  // Clamp between 0 and 100, rounded to 1 decimal place
  const clamped = Math.max(0, Math.min(100, rawScore));
  return Math.round(clamped * 10) / 10;
}
