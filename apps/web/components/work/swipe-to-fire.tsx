"use client";

import * as React from "react";
import { Button, CloseIcon, cn, FiringMark, Text } from "@syn/ui";
import { SWIPE_REVEAL_PX, useSwipeRow } from "@/lib/hooks/use-swipe-row";

/**
 * SwipeToFire — a work row on the phone, swiped right (USE-70; D-USE-53,
 * D-USE-61; work/today/states/thumb-firing.md). The row slides right over a
 * surface-grey reveal holding the firing mark over "Prompt sent" in dark
 * rust, a hairline at the row's leading edge; let go past the reveal and it
 * fires in place. `disabled` on a firing row and wherever nothing fires.
 *
 * The ring stays the tap way in (D-USE-53), so the reveal is `aria-hidden`.
 * Under reduced motion the row still follows the finger, and settles back
 * with no slide. `staged` holds the row mid-swipe for the capture only.
 */
export interface SwipeToFireProps {
  children: React.ReactNode;
  /** "Prompt sent". */
  word: string;
  disabled: boolean;
  onFire: () => void;
  /** A scenario's row held open by this many px (`?state=` only). */
  staged?: number;
}

export function SwipeToFire({
  children,
  word,
  disabled,
  onFire,
  staged,
}: SwipeToFireProps) {
  const swipe = useSwipeRow({ disabled, onFire });
  const offset = swipe.dragging ? swipe.offset : (staged ?? swipe.offset);
  const settling = !swipe.dragging && staged === undefined;

  return (
    <div
      data-swipe-row
      className="relative touch-pan-y overflow-hidden"
      {...swipe.handlers}
    >
      {offset > 0 ? (
        <div
          aria-hidden="true"
          data-swipe-reveal
          data-armed={offset >= SWIPE_REVEAL_PX || undefined}
          className="bg-surface text-firing-text absolute inset-y-0 start-0 flex flex-col items-center justify-center gap-(--space-2) overflow-hidden rounded-s-(--radius-control)"
          style={{ width: Math.max(offset, 0) }}
        >
          <FiringMark halo />
          <span className="text-(length:--fs-label) leading-(--lh-label) font-medium whitespace-nowrap">
            {word}
          </span>
        </div>
      ) : null}
      <div
        className={cn(
          "bg-background relative",
          offset > 0 && "border-ink border-s",
          settling &&
            "transition-transform duration-(--dur-state) ease-(--ease-settle) motion-reduce:transition-none",
        )}
        style={
          offset > 0 ? { transform: `translateX(${offset}px)` } : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

/**
 * SwipeHint — the one-time hint under the Work header on the phone
 * (C-USE-today-thumb-firing-3): bordered, the firing mark at the left, the
 * words, × to close it for good. The screen hides it once the swipe is used.
 */
export interface SwipeHintProps {
  /** "Swipe a work row right to send it firing. …" */
  text: string;
  /** "Close the hint". */
  closeName: string;
  onClose: () => void;
}

export function SwipeHint({ text, closeName, onClose }: SwipeHintProps) {
  return (
    <div
      data-swipe-hint
      className="border-border flex items-start gap-(--space-3) rounded-(--radius-card) border py-(--space-2) ps-(--space-3) pe-(--space-1)"
    >
      <span className="flex h-(--target) shrink-0 items-center">
        <FiringMark halo />
      </span>
      <Text
        as="p"
        variant="secondary"
        className="min-w-0 flex-1 py-(--space-2)"
      >
        {text}
      </Text>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={closeName}
        onClick={onClose}
        className="text-muted-foreground shrink-0"
      >
        <CloseIcon aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
