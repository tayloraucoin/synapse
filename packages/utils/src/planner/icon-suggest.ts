/**
 * suggestIcons — "Suggested for <name>" in the icon picker (USE-11): a name's
 * words matched against each entry's keywords, on the device, with no request
 * and no model call (record 0001; D-USE-35).
 *
 * The same function serves both sets: an emoji's Emojibase tags and label,
 * and a Lucide icon's name and tags. A word scores 3 against a keyword it
 * equals, 2 against one that starts with it or that it starts with ("run" and
 * "running"), and 1 when the two share a five-letter stem ("meditate" and
 * "meditation"). An entry's score is its best per word, summed over the
 * name's words; ties keep the set's own order.
 */

export interface IconSuggestEntry {
  id: string;
  keywords: readonly string[];
}

const MIN_PREFIX = 3;
const MIN_STEM = 5;

/** A name's words, lower case, of three letters or more. */
function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= MIN_PREFIX);
}

function sharedStem(a: string, b: string): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n += 1;
  return n;
}

function scoreWord(word: string, keyword: string): number {
  if (word === keyword) return 3;
  if (keyword.startsWith(word) || word.startsWith(keyword)) {
    return Math.min(word.length, keyword.length) >= MIN_PREFIX ? 2 : 0;
  }
  return sharedStem(word, keyword) >= MIN_STEM ? 1 : 0;
}

export function suggestIcons(
  name: string,
  entries: readonly IconSuggestEntry[],
  limit = 5,
): string[] {
  const words = wordsOf(name);
  if (words.length === 0 || limit <= 0) return [];

  const scored: { id: string; score: number; index: number }[] = [];
  entries.forEach((entry, index) => {
    const keywords = entry.keywords.flatMap(wordsOf);
    let score = 0;
    for (const word of words) {
      let best = 0;
      for (const keyword of keywords) {
        best = Math.max(best, scoreWord(word, keyword));
        if (best === 3) break;
      }
      score += best;
    }
    if (score > 0) scored.push({ id: entry.id, score, index });
  });

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.id);
}
