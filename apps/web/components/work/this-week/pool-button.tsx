"use client";

import * as React from "react";
import { cn, FromPoolIcon } from "@syn/ui";
import { THIS_WEEK_DAY_WORDS as WORDS } from "@/lib/data/this-week-day";

/**
 * PoolButton (USE-81; work/this-week/index.md › Layout 5): at the foot's
 * left, a 52 px pill in ink with the layers glyph and "Pool", in thumb reach
 * beside the +. It opens the pool sheet over the day; it stays live offline
 * (offline.md) and on a day with no Work block (no-work-block.md), and waits
 * only while the day loads or has failed.
 */

export const PoolButton = React.forwardRef<
  HTMLButtonElement,
  { onOpen: () => void; disabled?: boolean }
>(function PoolButton({ onOpen, disabled = false }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={WORDS.poolName}
      aria-haspopup="dialog"
      disabled={disabled}
      onClick={onOpen}
      className={cn(
        "flex h-13 items-center gap-(--space-2) rounded-full bg-primary px-(--space-5) text-(length:--fs-body) font-semibold text-primary-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:bg-fill-muted disabled:text-muted-foreground",
      )}
    >
      <FromPoolIcon aria-hidden="true" className="size-4" />
      {WORDS.pool}
    </button>
  );
});
