import { describe, it, expect } from "vitest";
import { calculateMQMScore, DEFAULT_WEIGHTS } from "@/lib/scoring";

describe("MQM Scoring Formula", () => {
  it("should return 100 for zero errors", () => {
    const score = calculateMQMScore([], 100);
    expect(score).toBe(100);
  });

  it("should correctly deduct weighted penalty for MINOR, MAJOR, CRITICAL errors", () => {
    // 1 minor (1), 1 major (5), 1 critical (10) -> total penalty = 16
    // wordCount = 100 -> score = 100 - (100 * 16 / 100) = 84
    const errors = [
      { severity: "MINOR" as const },
      { severity: "MAJOR" as const },
      { severity: "CRITICAL" as const },
    ];
    const score = calculateMQMScore(errors, 100);
    expect(score).toBe(84);
  });

  it("should clamp at 0 when penalties exceed 100 points", () => {
    const errors = [
      { severity: "CRITICAL" as const },
      { severity: "CRITICAL" as const },
      { severity: "CRITICAL" as const },
      { severity: "CRITICAL" as const },
    ]; // 40 penalty on 20 words = 200 penalty -> clamped to 0
    const score = calculateMQMScore(errors, 20);
    expect(score).toBe(0);
  });

  it("should use minimum baseline of 20 words to prevent division anomalies", () => {
    const errors = [{ severity: "MINOR" as const }]; // penalty = 1
    // word count 5 -> baseline 20 -> 100 - (100 * 1 / 20) = 95
    const score = calculateMQMScore(errors, 5);
    expect(score).toBe(95);
  });
});
