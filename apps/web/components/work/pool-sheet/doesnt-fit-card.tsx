"use client";

import { cn, DisclosureIcon, Text } from "@syn/ui";
import type { DoesntFitView } from "@/lib/data/place-sheet";

/**
 * DoesntFitCard (USE-80; place-from-the-pool/states/doesnt-fit.md): one day
 * picked that its Work cannot hold. By how much, in lengths only; why, at the
 * top of the ranges; "Spread it across the week" (USE-78's sheet for the
 * item) and the next day with room with "Use <Day>". Never red, never a count
 * of what is over (C-USE-place-from-the-pool-doesnt-fit-1). Its first line is
 * announced when it appears [PROPOSED].
 */

export interface DoesntFitCardProps {
  card: DoesntFitView;
  onSpread: () => void;
  onUse: (dateKey: string) => void;
  disabled?: boolean;
}

const ROW = cn(
  "flex min-h-11 w-full items-center gap-(--space-2) border-t border-hairline text-start outline-none",
  "focus-visible:ring-2 focus-visible:ring-ring",
);

export function DoesntFitCard({
  card,
  onSpread,
  onUse,
  disabled = false,
}: DoesntFitCardProps) {
  return (
    <div className="flex flex-col rounded-(--radius-sheet) border border-hairline p-(--space-3)">
      <Text
        as="p"
        role="status"
        className="text-(length:--fs-body) font-semibold text-foreground"
      >
        {card.headline}
      </Text>
      <Text
        as="p"
        className="pt-(--space-1) pb-(--space-3) text-(length:--fs-caption) text-muted-foreground"
      >
        {card.why}
      </Text>
      {card.spread ? (
        <button
          type="button"
          onClick={onSpread}
          disabled={disabled}
          className={ROW}
        >
          <span className="text-(length:--fs-body) text-foreground">
            {card.spreadWords}
          </span>
          <DisclosureIcon
            aria-hidden="true"
            className="ms-auto size-4 shrink-0 text-foreground"
          />
        </button>
      ) : null}
      {card.next ? (
        <div className="flex min-h-11 items-center gap-(--space-2) border-t border-hairline">
          <span className="text-(length:--fs-body) text-foreground">
            {card.next.line}
          </span>
          <button
            type="button"
            aria-label={card.next.name}
            disabled={disabled}
            onClick={() => onUse(card.next!.dateKey)}
            className={cn(
              "-me-(--space-2) ms-auto min-h-11 rounded-(--radius-control) px-(--space-2) text-(length:--fs-label) font-semibold text-foreground outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {card.next.use}
          </button>
        </div>
      ) : null}
    </div>
  );
}
