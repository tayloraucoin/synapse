import Link from "next/link";
import { cn } from "@syn/ui";
import { DueBadge } from "@/components/work";
import type { ChipView, EventChipView } from "@/lib/data/week-view";

/**
 * The Week's chips (USE-72, D-USE-42): work on the page in surface grey, no
 * border; the emoji then two non-breaking spaces (D-USE-48), the meta under
 * it, the due badge for this column under that. Never a firing time
 * (D-USE-98). A past column's chip recedes and still opens.
 */
export function WorkChip({
  chip,
  href,
  past,
}: {
  chip: ChipView;
  href: string;
  past: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={chip.label}
      data-week-chip={chip.id}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-(--radius-control) bg-surface px-2 py-1.5",
        "text-caption outline-none hover:bg-fill-muted focus-visible:ring-2 focus-visible:ring-ring",
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
