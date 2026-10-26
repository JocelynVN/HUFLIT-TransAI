import { describe, it, expect } from "vitest";
import { matchSpan } from "@/lib/spanMatcher";

describe("Unicode Span Matcher", () => {
  it("should find exact match in Vietnamese text with diacritics", () => {
    const text = "Đà Nẵng đã trở thành một trong những thành phố ven biển năng động nhất Việt Nam.";
    const quote = "thành phố ven biển";

    const result = matchSpan(text, quote);
    expect(result.anchorStatus).toBe("ANCHORED");
    expect(result.startOffset).not.toBeNull();
    expect(result.endOffset).not.toBeNull();

    const extracted = text.substring(result.startOffset!, result.endOffset!);
    expect(extracted).toBe(quote);
  });

  it("should handle occurrenceIndex for recurring words", () => {
    const text = "thành phố này là một thành phố rất đẹp";
    const quote = "thành phố";

    const first = matchSpan(text, quote, 0);
    expect(first.startOffset).toBe(0);

    const second = matchSpan(text, quote, 1);
    expect(second.startOffset).toBe(21);
    expect(text.substring(second.startOffset!, second.endOffset!)).toBe(quote);
  });

  it("should return UNANCHORED when quote does not exist in text without throwing", () => {
    const text = "Sinh viên thực hành dịch thuật với sự hỗ trợ của AI.";
    const quote = "máy vi tính xách tay";

    const result = matchSpan(text, quote);
    expect(result.anchorStatus).toBe("UNANCHORED");
    expect(result.startOffset).toBeNull();
    expect(result.endOffset).toBeNull();
  });
});
