/**
 * The block kinds' words — UX v1.1 §3.1, §6.1, §12.2. The default name a
 * block header shows when the day's block has no template name of its own
 * (an unstructured day's orient and wind-down, a training or break block).
 *
 * The words live in `@syn/constants` since DYN-20, so a push's title
 * (*Before work · 8:15*) and the band's gutter label are one string; this
 * re-export keeps the composite's import unchanged.
 */
import { BLOCK_KIND_WORDS as WORDS } from "@syn/constants";
import type { BlockKind } from "@syn/types";

export const BLOCK_KIND_WORDS: Record<BlockKind, string> = WORDS;

export const BLOCK_HEADER_COPY = {
  /** The pooled block's band, before the pick (v1.1 §3.11, §4.13). */
  decideInTheMorning: "decide in the morning",
} as const;
