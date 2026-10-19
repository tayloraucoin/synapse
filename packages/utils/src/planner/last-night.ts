import { DEFAULT_JOURNAL_PROMPTS, ORIENT_READBACK_KEYS } from "@syn/constants";

/**
 * "Last night" (USE-13; D-USE-14, UX v1.2 §5.2): the evening's three lines
 * read back on Orient, in `ORIENT_READBACK_KEYS` order, each under the
 * person's own prompt.
 *
 * ONE CHANGE TO THE PERSON'S WORDS. The first prompt is read back re-tensed:
 * its "tomorrow" reads "today" ("What I want to make happen tomorrow" reads
 * "What I want to make happen today"). Every other caption and every line is
 * left as written. A prompt renamed with no "tomorrow" in it reads as named.
 *
 * A key that is missing or blank is left out, never drawn as an empty entry.
 * A prompt the person removed still reads back under its default caption:
 * the answer was written, so it is theirs to read.
 */

export interface LastNightEntry {
  key: string;
  caption: string;
  text: string;
}

export interface LastNightPrompt {
  key: string;
  label: string;
}

const TOMORROW = /\btomorrow\b/gi;

function retense(caption: string): string {
  return caption.replace(TOMORROW, (word) =>
    word[0] === "T" ? "Today" : "today",
  );
}

export function lastNightEntries(
  entry: { answers: Readonly<Record<string, string>> } | null,
  prompts: ReadonlyArray<LastNightPrompt>,
): LastNightEntry[] {
  if (entry === null) return [];
  const entries: LastNightEntry[] = [];
  ORIENT_READBACK_KEYS.forEach((key, at) => {
    const text = entry.answers[key]?.trim() ?? "";
    if (text === "") return;
    const label =
      prompts.find((prompt) => prompt.key === key)?.label ??
      DEFAULT_JOURNAL_PROMPTS.find((prompt) => prompt.key === key)?.label ??
      key;
    entries.push({ key, caption: at === 0 ? retense(label) : label, text });
  });
  return entries;
}
