"use client";

import { Button, cn, FiringToggle, Text } from "@syn/ui";
import { WORK_PARTS_COPY } from "./copy";
import type { WorkRowHandlers, WorkRowView } from "./view";
import { WorkRowMeta } from "./work-row";

/**
 * NextCard — Next lifted as the card, inside a Work block with nothing in
 * hand (USE-57; D-USE-45, D-USE-49): in its own tier and place, shaded
 * `surface` with no border; the ring in its 44 × 44 lead slot, so it fires
 * from here as from any row; the emoji at 22 px beside the 17 px title; the
 * row's meta; then Start and Done halving the card, and from 768 at a fixed 160
 * right-aligned as the lifted card's (D-USE-39), Done right-most in ink (the screen's primary action).
 *
 * Props only. `onStart` and `onDone` are the screen's writes (USE-59); the
 * card decides nothing.
 */
export interface NextCardProps extends Pick<
  WorkRowHandlers,
  "onToggleFiring" | "onOpen"
> {
  row: WorkRowView;
  /** "Start", "Done", Done's name ("Done, <title>") and ", next"'s word. */
  words: { start: string; done: string; doneName: string; next: string };
  onStart?: () => void;
  onDone?: () => void;
  className?: string;
}

export function NextCard({
  row,
  words,
  onStart,
  onDone,
  onToggleFiring,
  onOpen,
  className,
}: NextCardProps) {
  return (
    <div
      data-next-card={row.id}
      className={cn(
        "bg-surface flex flex-col gap-(--space-3) rounded-(--radius-sheet) py-(--space-3) pe-(--space-4)",
        className,
      )}
    >
      <div className="flex items-start">
        <div className="flex size-(--target) shrink-0 items-center justify-center">
          <FiringToggle
            pressed={false}
            onPressedChange={(next) => onToggleFiring?.(row.id, next)}
            label={WORK_PARTS_COPY.fire(row.title)}
            disabled={onToggleFiring === undefined}
            className="disabled:cursor-default disabled:opacity-100"
          />
        </div>
        <div className="min-w-0 flex-1 pt-(--space-2)">
          <button
            type="button"
            data-open
            onClick={() => onOpen?.(row.id)}
            aria-label={`${row.title}, ${words.next}`}
            className="flex w-full cursor-pointer items-start gap-(--space-2) text-start"
          >
            <span
              aria-hidden="true"
              className="font-emoji inline-flex h-(--lh-heading) w-5.5 shrink-0 items-center justify-center text-(length:--fs-title) leading-none"
            >
              {row.emoji}
            </span>
            <Text as="span" variant="heading" weight={500} className="min-w-0">
              {row.title}
            </Text>
          </button>
          <WorkRowMeta row={row} />
        </div>
      </div>
      <div className="wide:flex wide:justify-end grid grid-cols-2 gap-(--space-2) ps-(--space-3)">
        <Button
          variant="secondary"
          size="lg"
          onClick={onStart}
          className="bg-background wide:w-40"
        >
          {words.start}
        </Button>
        <Button
          size="lg"
          aria-label={words.doneName}
          onClick={onDone}
          className="wide:w-40"
        >
          {words.done}
        </Button>
      </div>
    </div>
  );
}
