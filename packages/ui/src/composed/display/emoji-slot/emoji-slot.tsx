/**
 * EmojiSlot — the one home for the emoji rule (UX v1.2 §10.2, R29; RUN-7).
 *
 * "One rule for every slot: the glyph sits in a 44px square, `text-[1.25rem]`
 * on rows and `text-[1.5rem]` in card headers, `font-emoji`, vertically
 * centred on the row's control, with `aria-hidden`." Every row and card
 * header that shows the person's own emoji renders it through this, so the
 * square, the size and the hiding are decided once.
 *
 * DISPLAY ONLY. It never opens the picker — `EmojiPicker` exists for that,
 * and the feature folder wires the two. It takes any `IconValue` so a row
 * whose icon is a curated glyph or an image still lays out on the same
 * 44px square: those go through `ItemIcon`, the emoji is drawn here.
 *
 * ALWAYS `aria-hidden`. The title beside it is the accessible name.
 */
import type { IconValue } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { ItemIcon } from "../item-icon";

export type EmojiSlotSize = "row" | "card";

export interface EmojiSlotProps {
  icon: IconValue | null;
  /** `row` — 1.25rem; `card` — 1.5rem, the card header's. */
  size?: EmojiSlotSize;
  /** Resolved by the caller for an `IconValue` of kind "image". */
  imageUrl?: string | null;
  className?: string;
}

const EMOJI_TEXT: Record<EmojiSlotSize, string> = {
  row: "text-[1.25rem]",
  card: "text-[1.5rem]",
};

/** Narrows an unknown `leading` to an `IconValue` so a row can accept either. */
export function isIconValue(value: unknown): value is IconValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "value" in value &&
    typeof (value as { kind: unknown }).kind === "string"
  );
}

export function EmojiSlot({ icon, size = "row", imageUrl = null, className }: EmojiSlotProps) {
  return (
    <span
      aria-hidden="true"
      data-emoji-slot
      className={cn(
        "inline-flex size-(--target) shrink-0 items-center justify-center",
        className,
      )}
    >
      {icon?.kind === "emoji" ? (
        <span className={cn("font-emoji leading-none", EMOJI_TEXT[size])}>{icon.value}</span>
      ) : (
        <ItemIcon icon={icon} size={24} imageUrl={imageUrl} />
      )}
    </span>
  );
}
