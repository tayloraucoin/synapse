import { Button, cn, Text } from "@syn/ui";
import { HUE_BORDER } from "../block-hue";
import type { DayColumnOffer } from "./day-column";

/**
 * OfferBand — a Google event answered maybe or not at all (USE-109;
 * google-events.md, D-USE-87): a faint dashed plum edge with no fill, its
 * line muted ("[Coffee with Ana] 11:00 · maybe") and a small secondary Add
 * to day. The dash and "maybe" tell it from a yes band, never the colour
 * alone. One line high; it takes no time. Props only.
 */
export function OfferBand({ offer }: { offer: DayColumnOffer }) {
  return (
    <div
      data-offer-band
      data-event-id={offer.id}
      className={cn(
        "mb-1 flex h-7 min-w-0 items-center gap-(--space-2) rounded-(--radius-control) border border-dashed ps-(--space-2) pe-0.5",
        HUE_BORDER.plum,
      )}
    >
      <Text as="span" variant="secondary" tone="muted" truncate>
        {offer.title}
      </Text>
      <Text
        as="span"
        variant="secondary"
        tone="muted"
        className="shrink-0 tabular-nums"
      >
        {offer.meta}
      </Text>
      {offer.onAdd ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          data-no-drag
          onClick={offer.onAdd}
          className="ms-auto h-6 shrink-0"
        >
          {offer.actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
