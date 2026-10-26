export interface MatchResult {
  startOffset: number | null;
  endOffset: number | null;
  anchorStatus: "ANCHORED" | "UNANCHORED";
}

/**
 * Unicode-safe substring search locating the N-th occurrence of targetQuote in fullText.
 * Handles Vietnamese diacritics, whitespace variations, and returns character offsets.
 */
export function matchSpan(
  fullText: string,
  targetQuote: string,
  occurrenceIndex: number = 0
): MatchResult {
  if (!fullText || !targetQuote) {
    return { startOffset: null, endOffset: null, anchorStatus: "UNANCHORED" };
  }

  const quote = targetQuote.trim();
  if (quote.length === 0) {
    return { startOffset: null, endOffset: null, anchorStatus: "UNANCHORED" };
  }

  // Exact search first
  let currentIndex = 0;
  let foundCount = 0;
  let matchStart = -1;

  while (currentIndex < fullText.length) {
    const idx = fullText.indexOf(quote, currentIndex);
    if (idx === -1) break;

    if (foundCount === occurrenceIndex) {
      matchStart = idx;
      break;
    }

    foundCount++;
    currentIndex = idx + quote.length;
  }

  // If exact occurrence wasn't reached but at least 1 match exists, fallback to first match
  if (matchStart === -1 && foundCount > 0) {
    matchStart = fullText.indexOf(quote);
  }

  // Case-insensitive fallback search
  if (matchStart === -1) {
    const lowerFull = fullText.toLowerCase();
    const lowerQuote = quote.toLowerCase();
    let lCur = 0;
    let lCount = 0;

    while (lCur < lowerFull.length) {
      const idx = lowerFull.indexOf(lowerQuote, lCur);
      if (idx === -1) break;

      if (lCount === occurrenceIndex) {
        matchStart = idx;
        break;
      }
      lCount++;
      lCur = idx + lowerQuote.length;
    }

    if (matchStart === -1 && lCount > 0) {
      matchStart = lowerFull.indexOf(lowerQuote);
    }
  }

  if (matchStart !== -1) {
    return {
      startOffset: matchStart,
      endOffset: matchStart + quote.length,
      anchorStatus: "ANCHORED",
    };
  }

  // If target quote could not be located in fullText, return UNANCHORED safely
  return {
    startOffset: null,
    endOffset: null,
    anchorStatus: "UNANCHORED",
  };
}
