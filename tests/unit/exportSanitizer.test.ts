import { describe, it, expect } from "vitest";
import { sanitizeCSVCell, buildCSV } from "@/lib/exportSanitizer";

describe("CSV Export Sanitizer", () => {
  it("should escape formula injection characters =, +, -, @", () => {
    expect(sanitizeCSVCell("=cmd|'/C calc'!A0")).toBe(`"'=cmd|'/C calc'!A0"`);
    expect(sanitizeCSVCell("+1234")).toBe(`"'+1234"`);
    expect(sanitizeCSVCell("-5678")).toBe(`"'-5678"`);
    expect(sanitizeCSVCell("@SUM(A1:A10)")).toBe(`"'@SUM(A1:A10)"`);
  });

  it("should safely escape internal double quotes", () => {
    expect(sanitizeCSVCell('Hello "world"')).toBe(`"Hello ""world"""`);
  });

  it("should prepend UTF-8 Byte Order Mark (BOM) to CSV output", () => {
    const csv = buildCSV([
      ["Mã sinh viên", "Điểm số"],
      ["P-001", 95],
    ]);

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("Mã sinh viên");
    expect(csv).toContain("P-001");
  });
});
