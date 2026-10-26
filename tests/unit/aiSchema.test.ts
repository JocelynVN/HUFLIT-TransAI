import { describe, it, expect } from "vitest";
import { structuredOutputSchema } from "@/lib/ai/schema";

describe("Structured AI Output Schema (Zod)", () => {
  it("should validate a valid MQM evaluation output", () => {
    const validData = {
      overallComment: "Bản dịch tương đối chính xác và mượt mà.",
      strengths: ["Dịch đúng cấu trúc ngữ pháp", "Chọn từ vựng tự nhiên"],
      errors: [
        {
          category: "ACCURACY",
          subtype: "MISTRANSLATION",
          severity: "MAJOR",
          targetQuote: "trên các đám mây",
          occurrenceIndex: 0,
          sourceEvidence: "above the clouds",
          explanation: "Cách diễn đạt gượng gạo theo tiếng Anh.",
          suggestion: "giữa biển mây",
        },
      ],
      suggestedTranslations: ["Phương án dịch tham khảo hoàn chỉnh."],
      learningTips: ["Chú ý trau chuốt tính từ miêu tả cảnh quan."],
    };

    const parsed = structuredOutputSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("should reject invalid categories or severities", () => {
    const invalidData = {
      overallComment: "Test",
      errors: [
        {
          category: "INVALID_CAT",
          severity: "SUPER_CRITICAL",
          targetQuote: "abc",
          explanation: "xyz",
        },
      ],
    };

    const parsed = structuredOutputSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});
