/**
 * EmojiPicker — the emoji pane of the icon picker (v2 handoff §5.4, reuse CC).
 *
 * WHY FRIMOUSSE. It is unstyled and composable, dependency-free, and — the
 * deciding property — it lets the Emojibase dataset be served from our own
 * origin via `emojibaseUrl`. Image-sprite pickers request a file per emoji
 * from a third party; `scripts/copy-emoji-data.mjs` stages the dataset into
 * `apps/web/public/emoji` so this component makes no external request and
 * keeps working offline, which a PWA has to.
 *
 * It renders NATIVE system emoji rather than a vendor's art style, so the mark
 * a person picks is the mark their own keyboard produces — and the same one
 * their phone will draw in the row.
 *
 * Synapse's changes to CC's copy: the token skin, and the 44px cells the rest
 * of this package uses. The dataset is heavy; callers mount it behind the
 * picker's own tab rather than eagerly.
 */
"use client";

import { EmojiPicker as Frimousse } from "frimousse";
import * as React from "react";

import { cn } from "../../../lib/cn";

export interface EmojiPickerProps {
  /** Called with the chosen emoji character. */
  onSelect: (emoji: string) => void;
  /**
   * Where the Emojibase JSON is served from — `${url}/${locale}/data.json`.
   * Defaults to our own origin; pass nothing in the product.
   */
  emojibaseUrl?: string;
  searchLabel?: string;
  className?: string;
}

export function EmojiPicker({
  onSelect,
  emojibaseUrl = "/emoji",
  searchLabel = "Search emoji",
  className,
}: EmojiPickerProps) {
  return (
    <Frimousse.Root
      columns={8}
      emojibaseUrl={emojibaseUrl}
      onEmojiSelect={(emoji) => onSelect(emoji.emoji)}
      className={cn("bg-paper isolate flex h-80 w-full flex-col", className)}
    >
      <div className="border-hairline flex items-center gap-(--space-2) border-b px-(--space-3) py-(--space-2)">
        <Frimousse.Search
          aria-label={searchLabel}
          placeholder="Search"
          className={cn(
            "text-ink min-w-0 flex-1 bg-transparent py-(--space-2)",
            "text-(length:--fs-body) placeholder:text-text-secondary",
            "rounded-(--radius) outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        />
        <Frimousse.SkinToneSelector
          aria-label="Change skin tone"
          className="flex size-(--target) shrink-0 items-center justify-center text-(length:--fs-body)"
        />
      </div>

      <Frimousse.Viewport className="relative flex-1 outline-none">
        <Frimousse.Loading className="text-text-secondary absolute inset-0 flex items-center justify-center text-(length:--fs-secondary)">
          Loading…
        </Frimousse.Loading>
        <Frimousse.Empty className="text-text-secondary absolute inset-0 flex items-center justify-center px-(--space-4) text-center text-(length:--fs-secondary)">
          {({ search }) => `Nothing for “${search}”.`}
        </Frimousse.Empty>
        <Frimousse.List
          className="pb-(--space-2) select-none"
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div
                className="bg-paper text-text-secondary px-(--space-3) pt-(--space-3) pb-(--space-1) text-(length:--fs-caption)"
                {...props}
              >
                {category.label}
              </div>
            ),
            Row: ({ children, ...props }) => (
              <div className="flex px-(--space-2)" {...props}>
                {children}
              </div>
            ),
            Emoji: ({ emoji, ...props }) => (
              <button
                type="button"
                className={cn(
                  "flex size-(--target) items-center justify-center rounded-(--radius) text-[1.25rem]",
                  "data-[active]:bg-surface",
                )}
                {...props}
              >
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </Frimousse.Viewport>
    </Frimousse.Root>
  );
}
