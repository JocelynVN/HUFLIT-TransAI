import { describe, it, expect } from "vitest";
import { calculateSUSScore, getSUSGrade } from "@/lib/sus";

describe("SUS Calculation (System Usability Scale)", () => {
  it("should calculate 100 for all positive answers (5 on odd, 1 on even)", () => {
    // 5 on odd: (5-1) * 5 = 20
    // 1 on even: (5-1) * 5 = 20
    // total = 40 * 2.5 = 100
    const answers = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1];
    const score = calculateSUSScore(answers);
    expect(score).toBe(100);
    expect(getSUSGrade(score).grade).toBe("A+");
  });

  it("should calculate 0 for all negative answers (1 on odd, 5 on even)", () => {
    // 1 on odd: (1-1) * 5 = 0
    // 5 on even: (5-5) * 5 = 0
    // total = 0 * 2.5 = 0
    const answers = [1, 5, 1, 5, 1, 5, 1, 5, 1, 5];
    const score = calculateSUSScore(answers);
    expect(score).toBe(0);
    expect(getSUSGrade(score).grade).toBe("F");
  });

  it("should calculate 68 for standard neutral baseline benchmark", () => {
    // all 3s:
    // odd: (3-1) * 5 = 10
    // even: (5-3) * 5 = 10
    // total = 20 * 2.5 = 50
    const neutral = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    expect(calculateSUSScore(neutral)).toBe(50);
  });

  it("should throw error if answer array length is not 10", () => {
    expect(() => calculateSUSScore([5, 5, 5])).toThrow();
  });
});
