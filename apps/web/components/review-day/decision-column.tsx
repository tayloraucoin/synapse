"use client";

import * as React from "react";

import {
  CollapsiblePanel,
  DecisionPanel,
  GroupHeading,
  ListRow,
  Text,
  type Decision,
} from "@syn/ui";
import type { MissTier, ReasonView } from "@syn/types";
import { formatClock } from "@syn/utils";

import { REVIEW_COPY as COPY } from "./copy";
import type { ReviewDay } from "./use-review-day";

/**
 * DR-01's body — one panel per undone item, then what is already settled.
 *
 * THE ORDER IS THE DAY'S. Panels appear in schedule order with deferred items
 * last, because reviewing a day is walking back through it; sorting by
 * anything else — priority, category — would make the person reconstruct the
 * sequence in their head.
 *
 * CUT ITEMS ARE ALREADY DECIDED. A shift resolved them at the time, with a
 * reason the person gave then; the review shows that decision and offers
 * *Change*. Asking again about something already answered is the review
 * wasting the one attention budget it gets.
 *
 * *DONE* IS COLLAPSED. It is the part that went right and needs no decision;
 * opening it is for checking, not for working through.
 */
export function DecisionColumn({
  day,
  reasons,
  onDecide,
  onOpenItem,
}: {
  day: ReviewDay;
  reasons: Readonly<Record<MissTier, readonly ReasonView[]>> | null;
  onDecide: (itemId: string, decision: Decision) => void;
  onOpenItem: (itemId: string) => void;
}) {
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const empty: Record<MissTier, readonly ReasonView[]> = {
    circumstance: [],
    scoping: [],
    chose_not_to: [],
  };

  function panelFor(
    entry: ReviewDay["toDecide"][number],
    state: ReviewDay["toDecide"][number]["state"],
  ) {
    return (
      <DecisionPanel
        key={entry.item.id}
        item={entry.item}
        state={state}
        decision={toDecision(entry)}
        reasons={reasons ?? empty}
        // A habit cannot be carried — tomorrow's copy of it already exists in
        // tomorrow's plan (Epic 3 DR-02).
        canCarry={entry.item.type === "task_appointment"}
        carriedCount={entry.carriedCount}
        carriedSince={entry.carriedSince ?? undefined}
        shiftContext={
          entry.shiftContext === null
            ? undefined
            : { deltaMin: entry.shiftContext.deltaMin }
        }
        timeZone={day.timezone ?? "UTC"}
        onCarry={() => onDecide(entry.item.id, { kind: "carry" })}
        onMissed={() => undefined}
        onDecide={(decision) => onDecide(entry.item.id, decision)}
        onChange={() => undefined}
        // REV-3 wires the traded-up picker; until then the chip selects and
        // the panel waits, which is what the ticket asks for.
        onTradedUp={() => undefined}
        note={notes[entry.item.id] ?? ""}
        onNoteChange={(note) =>
          setNotes((current) => ({ ...current, [entry.item.id]: note }))
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-(--space-5)">
      {day.toDecide.length === 0 ? null : (
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.toDecide}</GroupHeading>
          {sortForReview(day.toDecide).map((entry) =>
            panelFor(entry, entry.state),
          )}
        </section>
      )}

      {day.cut.length === 0 ? null : (
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.cutWhenShifted}</GroupHeading>
          {day.cut.map((entry) => panelFor(entry, entry.state))}
        </section>
      )}

      {day.doneItems.length === 0 ? null : (
        <CollapsiblePanel
          trigger={
            <Text as="span" variant="row-title">
              {COPY.doneSection}
            </Text>
          }
        >
          <ul className="flex flex-col">
            {day.doneItems.map((item) => (
              <ListRow
                key={item.id}
                as="li"
                title={item.title}
                meta={doneMeta(item, day.timezone ?? "UTC")}
                trailing={
                  <button
                    type="button"
                    className="text-text-secondary underline"
                    onClick={() => onOpenItem(item.id)}
                  >
                    {COPY.edit}
                  </button>
                }
              />
            ))}
          </ul>
        </CollapsiblePanel>
      )}

      {/*
       * The reflections section is a header with a count and no body — REV-3
       * fills it. It is present rather than absent so the day's shape is
       * complete: a person who rated three things yesterday should see that
       * they did, even before the block that shows them exists.
       */}
      {day.reflections.rateable === 0 ? null : (
        <CollapsiblePanel
          trigger={
            <Text as="span" variant="row-title">
              {COPY.reflections(day.reflections.rated, day.reflections.rateable)}
            </Text>
          }
        >
          <span />
        </CollapsiblePanel>
      )}
    </div>
  );
}

/** Schedule order, deferred last — the day walked back through. */
function sortForReview(
  entries: readonly ReviewDay["toDecide"][number][],
): ReviewDay["toDecide"][number][] {
  return [...entries].sort((a, b) => {
    const deferredA = a.item.state === "deferred" ? 1 : 0;
    const deferredB = b.item.state === "deferred" ? 1 : 0;
    if (deferredA !== deferredB) return deferredA - deferredB;

    const startA =
      a.item.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY;
    const startB =
      b.item.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY;
    return startA - startB;
  });
}

/**
 * The panel's `Decision` from the stored miss.
 *
 * THE LABEL GOES IN `reasonText` FOR DISPLAY and the key stays in `reasonKey`
 * for the write — the composite prints what it is given, and what it should
 * print is the reason's words rather than `slept_in`.
 */
function toDecision(
  entry: ReviewDay["toDecide"][number],
): Decision | null {
  if (entry.item.state === "carried") return { kind: "carry" };
  if (entry.decision === null) return null;
  if (entry.verdict === null) return null;

  return {
    kind: "missed",
    tier: entry.decision.tier,
    reasonKey: entry.decision.reasonKey,
    reasonText: entry.decision.reasonLabel ?? entry.decision.reasonText,
    tradedUpItemId: entry.decision.tradedUpItemId,
    verdict: entry.verdict,
  };
}

/** "done 7:24" · "done 14:52 · moved from 7:20" */
function doneMeta(
  item: ReviewDay["doneItems"][number],
  timeZone: string,
): string {
  if (item.doneAt === null) return "";
  const done = COPY.doneRow(formatClock(item.doneAt, timeZone));

  const moved =
    item.originalScheduledStart !== null &&
    item.scheduledStart !== null &&
    item.originalScheduledStart.getTime() !== item.scheduledStart.getTime();

  return moved && item.originalScheduledStart !== null
    ? COPY.doneRowMoved(
        formatClock(item.doneAt, timeZone),
        formatClock(item.originalScheduledStart, timeZone),
      )
    : done;
}
