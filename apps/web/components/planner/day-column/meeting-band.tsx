import { cn, LockedIcon, MeetingIcon, Text } from "@syn/ui";
import { HUE_CHIP, HUE_DOT } from "../block-hue";
import type { DayColumnEvent } from "./day-column";
import { HUE_EDGE } from "./mark-hue";

/**
 * MeetingBand — an event inside a block (USE-27; the meeting dev note,
 * D-USE-38): one band at its time across the block's full width, over its
 * rule, in the event's colour (plum by default) with its own 3 px rule and
 * hairlines top and bottom; the lock, its name, "<span> · Meeting". The
 * block keeps one header and its items sit above and below; nothing splits.
 * Part of the block, not its own target [ASSUMPTION]. Props only.
 *
 * A Synapse event (USE-53; event-inside-work.md) draws the calendar icon,
 * its name strong, its span, and its tag at the trailing end ("Work"), and
 * is its own button over the block's, opening the event to edit.
 */
export function MeetingBand({
  event,
  topPx,
  heightPx,
}: {
  event: DayColumnEvent;
  /** From the block's top. */
  topPx: number;
  heightPx: number;
}) {
  const own = event.event;
  return (
    <div
      data-meeting-band
      data-event-id={event.id}
      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
      className={cn(
        "absolute inset-x-0 flex border-y",
        own ? "pointer-events-auto" : "pointer-events-none",
        HUE_CHIP[event.hue],
        HUE_EDGE[event.hue],
      )}
    >
      {own ? (
        <button
          type="button"
          aria-label={own.name}
          onClick={own.onOpen}
          className="focus-visible:ring-ring absolute inset-0 focus-visible:ring-2 focus-visible:outline-none"
        />
      ) : null}
      <span
        aria-hidden="true"
        className={cn("w-0.75 shrink-0", HUE_DOT[event.hue])}
      />
      <div className="pointer-events-none flex min-w-0 flex-1 items-center gap-(--space-2) ps-(--space-3) pe-(--space-2)">
        {own ? (
          <MeetingIcon aria-hidden="true" className="size-3.5 shrink-0" />
        ) : (
          <LockedIcon aria-hidden="true" className="size-3 shrink-0" />
        )}
        <Text as="span" variant="secondary" weight={600} truncate>
          {event.title}
        </Text>
        <Text
          as="span"
          variant="caption"
          tone="muted"
          className="shrink-0 tabular-nums"
        >
          {event.meta}
        </Text>
        {own ? (
          <Text
            as="span"
            variant="caption"
            tone="muted"
            className="ms-auto shrink-0"
          >
            {own.tag}
          </Text>
        ) : null}
      </div>
    </div>
  );
}
