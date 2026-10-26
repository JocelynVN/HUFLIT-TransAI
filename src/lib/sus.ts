/**
 * System Usability Scale (SUS) Score Calculation
 * Standard formula according to John Brooke (1996):
 * For odd items (1, 3, 5, 7, 9): score = answer - 1
 * For even items (2, 4, 6, 8, 10): score = 5 - answer
 * Total SUS score = sum of 10 adjusted scores * 2.5 (Range: 0 to 100)
 */
export function calculateSUSScore(answers: number[]): number {
  if (!answers || answers.length !== 10) {
    throw new Error("SUS questionnaire requires exactly 10 responses (scores 1 to 5).");
  }

  let totalAdjusted = 0;

  for (let i = 0; i < 10; i++) {
    const val = Number(answers[i]);
    const clamped = Math.max(1, Math.min(5, isNaN(val) ? 3 : val));

    if (i % 2 === 0) {
      // Odd questions: 1, 3, 5, 7, 9 (0-indexed: 0, 2, 4, 6, 8)
      totalAdjusted += clamped - 1;
    } else {
      // Even questions: 2, 4, 6, 8, 10 (0-indexed: 1, 3, 5, 7, 9)
      totalAdjusted += 5 - clamped;
    }
  }

  const finalScore = totalAdjusted * 2.5;
  return Math.round(finalScore * 10) / 10;
}

export function getSUSGrade(score: number): {
  grade: string;
  adjective: string;
  acceptable: boolean;
} {
  if (score >= 85) return { grade: "A+", adjective: "Xuất sắc (Excellent)", acceptable: true };
  if (score >= 80) return { grade: "A", adjective: "Rất tốt (Good)", acceptable: true };
  if (score >= 68) return { grade: "B/C", adjective: "Đạt yêu cầu (OK / Acceptable)", acceptable: true };
  if (score >= 50) return { grade: "D", adjective: "Kém (Poor)", acceptable: false };
  return { grade: "F", adjective: "Không thể chấp nhận (Worst Imaginable)", acceptable: false };
}
