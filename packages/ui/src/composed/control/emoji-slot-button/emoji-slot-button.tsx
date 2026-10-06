/**
 * EmojiSlotButton — the glyph in a field's leading slot that opens the
 * picker (UX v1.2 §4.3, §4.4; RUN-8).
 *
 * A work-day type's name and a fixture's title carry their emoji in the
 * field's leading slot; tapping the slot opens `EmojiPicker` in a popover
 * and the choice lands back in the slot. `EmojiSlot` draws the glyph (the
 * 44px square, `aria-hidden`); this is the button around it, labelled
 * *Choose an icon* so the control has a name the glyph does not give.
 *
 * DISPLAY AND CHOICE, NOTHING ELSE. It never fills a default — a kind chip
 * does that on the screen — and it offers only emoji: the curated set and an
 * image are the habit sheet's chooser, not a type's or a fixture's.
 */
"use client";

import type { IconValue } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Popover, PopoverContent, PopoverTrigger } from "../../../primitives/feedback/popover";
import { EmojiSlot } from "../../display/emoji-slot";
import { EmojiPicker } from "../emoji-picker";

export interface EmojiSlotButtonProps {
  icon: IconValue | null;
  onChange: (icon: IconValue) => void;
  /** *Choose an icon* — the button's accessible name. */
  label: string;
  disabled?: boolean;
  /** Passed through to `EmojiPicker`; the product passes nothing. */
  emojibaseUrl?: string;
  className?: string;
}

export function EmojiSlotButton({
  icon,
  onChange,
  label,
  disabled = false,
  emojibaseUrl,
  className,
}: EmojiSlotButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "border-hairline hover:bg-surface inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius) border",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
            "disabled:opacity-40",
            className,
          )}
        >
          <EmojiSlot icon={icon} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(22rem,calc(100vw-32px))] p-0">
        <EmojiPicker
          emojibaseUrl={emojibaseUrl}
          onSelect={(emoji) => {
            onChange({ kind: "emoji", value: emoji });
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
