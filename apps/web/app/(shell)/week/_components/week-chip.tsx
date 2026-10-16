"use client";

import Link from "next/link";
import { cn, useDragSource } from "@syn/ui";
import { DueBadge } from "@/components/work";
import { PLACE_WORDS } from "@/lib/data/place";
import type { ChipView, EventChipView } from "@/lib/data/week-view";

/**
 * The Week's chips (USE-72, D-USE-42): work on the page in surface grey, no
 * border; the emoji then two non-breaking spaces (D-USE-48), the meta under
 * it, the due badge for this column under that. Never a firing time
 * (D-USE-98). A past column's chip recedes and still opens. With `dragId`
 * it carries to another cell or back onto the pool (USE-75); `ringed`, it
 * has just landed (or a drop there was refused): 1.5 px of ink, never alone,
 * the line under it says what happened.
 */
export function WorkChip({
  chip,
  href,
  past,
  dragId,
  ringed = false,
}: {
  chip: ChipView;
  href: string;
  past: boolean;
  dragId?: string;
  ringed?: boolean;
}) {
  const drag = useDragSource(dragId ?? chip.id, chip.title, {
    disabled: dragId === undefined,
  });
  return (
    <Link
      ref={drag.ref}
      {...drag.props}
      href={href}
      scroll={false}
      aria-label={chip.label}
      data-week-chip={chip.id}
      data-ringed={ringed ? "" : undefined}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-(--radius-control) bg-surface px-2 py-1.5",
        "text-caption outline-none hover:bg-fill-muted focus-visible:ring-2 focus-visible:ring-ring",
        ringed && "ring-[1.5px] ring-ink",
        drag.isDragging && "opacity-40",
      )}
    >
      <span className={past ? "text-muted-foreground" : "text-ink"}>
        {chip.emoji ? `${chip.emoji}\u00a0\u00a0` : null}
        {chip.title}
      </span>
      {chip.meta ? (
        <span className="text-muted-foreground">{chip.meta}</span>
      ) : null}
      {chip.due ? (
        <DueBadge
          word={chip.due.word}
          tone={chip.due.tone}
          className="mt-0.5"
        />
      ) : null}
    </Link>
  );
}

/** An event: plum, with its time, read only here (its popover is the Time lens's). */
export function EventChip({ event }: { event: EventChipView }) {
  return (
    <span className="block rounded-(--radius-control) border-s-3 border-category-plum-dot bg-category-plum-chip px-2 py-1 text-caption text-ink">
      {event.time} {event.title}
    </span>
  );
}

/**
 * Under a chip just placed (USE-75): "Added as session 2 of 3." and Undo,
 * muted; a refusal's line has no Undo. Announced by the screen's live region.
 */
export function LandedLine({
  line,
  onUndo,
  undoName,
}: {
  line: string;
  onUndo: (() => void) | null;
  undoName: string;
}) {
  return (
    <p className="px-0.5 text-caption text-muted-foreground">
      {line}
      {onUndo ? (
        <>
          {" "}
          <button
            type="button"
            onClick={onUndo}
            aria-label={undoName}
            className="rounded-(--radius-control) text-muted-foreground underline-offset-2 outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PLACE_WORDS.undo}
          </button>
        </>
      ) : null}
    </p>
  );
}
