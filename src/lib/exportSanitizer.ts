/**
 * Sanitizes a single cell value against CSV / Spreadsheet formula injection (CWE-1236).
 * Escapes leading characters =, +, -, @, \t, \r which Excel or LibreOffice might execute.
 */
export function sanitizeCSVCell(value: unknown): string {
  if (value === null || value === undefined) return '""';

  let str = String(value);

  // Check if cell starts with dangerous formula trigger characters
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes inside cell
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Builds a valid, UTF-8 BOM encoded CSV string from 2D array of rows.
 */
export function buildCSV(rows: (string | number | null | undefined)[][]): string {
  const BOM = "\uFEFF"; // UTF-8 Byte Order Mark for Excel
  const lines = rows.map((row) => row.map(sanitizeCSVCell).join(","));
  return BOM + lines.join("\r\n");
}
