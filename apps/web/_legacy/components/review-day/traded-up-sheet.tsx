"use client";

import * as React from "react";

import {
  Button,
  HelperText,
  Input,
  PickerList,
  ResponsiveSheet,
  Text,
  TRADED_UP_REASON_KEY,
  type Decision,
} from "@syn/ui";
import { formatClock } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";

import { REVIEW_COPY as COPY } from "./copy";
import type { ReviewDay } from "./use-review-day";

/**
 * DR-04 — *What did you stay on?*
 *
 * THE VERDICT IS SHOWN BEFORE IT IS CHOSEN. Each row carries the outcome
 * picking it would produce — *not counted* or *counts half* — because the
 * whole point of the question is that the answer changes what the day says,
 * and a person should not have to learn that rule by watching the number move.
 *
 * AN ACTIVE ITEM SAYS SO. Choosing something still running counts half *and
 * says it will change* when the item is finished, because the verdict is read
 * from the traded item's current row on every load (REV-1) rather than stored.
 * That is the ticket's non-negotiable — the verdict is never stored, it is
 * read — and it is what makes the tail honest rather than a promise.
 *
 * *SOMETHING NOT ON THE LIST* IS NOT A ROW WITH A TEXT FIELD. Choosing it
 * writes a null traded item, which the resolver treats as unverified — half —
 * so the text is a record of what it was, not evidence that it happened. The
 * sheet says half before the field is filled in.
 */
export function TradedUpSheet({
  open,
  day,
  onOpenChange,
  onChoose,
}: {
  open: boolean;
  day: ReviewDay;
  onOpenChange: (open: boolean) => void;
  onChoose: (decision: Decision) => void;
}) {
  const [otherOpen, setOtherOpen] = React.useState(false);
  const [otherText, setOtherText] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setOtherOpen(false);
      setOtherText("");
    }
  }, [open]);

  const zone = day.timezone ?? "UTC";
  const candidates = tradeCandidates(day);

  const items = candidates.map((entry) => ({
    id: entry.id,
    icon: entry.icon,
    title: entry.title,
    meta: (
      <Text as="span" tone="secondary">
        {entry.meta}
      </Text>
    ),
  }));

  function choose(id: string): void {
    if (id === OTHER_ID) {
      setOtherOpen(true);
      return;
    }
    /*
     * The verdict passed here is the PANEL'S optimistic label, not a stored
     * fact: `toWire` drops it, and REV-1 recomputes the real one from the
     * traded item's current row on the next read. A done item is verified —
     * *not counted*; one still running is not yet — *counts half*.
     */
    const stillRunning = day.activeItems.some((item) => item.id === id);
    onChoose({
      kind: "missed",
      tier: "scoping",
      reasonKey: TRADED_UP_REASON_KEY,
      reasonText: null,
      tradedUpItemId: id,
      verdict: stillRunning ? "half" : "not-counted",
    });
  }

  function saveOther(): void {
    const text = otherText.trim();
    if (text.length === 0) return;
    onChoose({
      kind: "missed",
      tier: "scoping",
      reasonKey: TRADED_UP_REASON_KEY,
      reasonText: text,
      // A null traded item is unverified by definition — there is nothing to
      // check it against, which is what the helper line says.
      tradedUpItemId: null,
      verdict: "half",
    });
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.tradedUpTitle}
        footer={
          otherOpen ? (
            <div className="flex justify-end gap-(--space-2)">
              <Button variant="ghost" onClick={() => setOtherOpen(false)}>
                {COPY.cancel}
              </Button>
              <Button
                disabled={otherText.trim().length === 0}
                onClick={saveOther}
              >
                {COPY.save}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {COPY.cancel}
              </Button>
            </div>
          )
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <Text as="p" tone="secondary">
            {COPY.tradedUpBody}
          </Text>

          {/*
            The extra line only when there is nothing to point at. It is not a
            warning — half is a real outcome, not a penalty — it just says what
            picking *Something not on the list* is about to do.
          */}
          {candidates.length === 0 ? (
            <Text as="p" tone="secondary">
              {COPY.tradedUpNothingDone}
            </Text>
          ) : null}

          {otherOpen ? (
            <Input
              label={COPY.tradedUpWhatWasIt}
              value={otherText}
              maxLength={OTHER_MAX}
              autoComplete="off"
              onChange={(event) => setOtherText(event.target.value)}
            />
          ) : (
            <PickerList
              groups={[
                {
                  heading: COPY.tradedUpHeading,
                  items: [
                    ...items,
                    { id: OTHER_ID, title: COPY.tradedUpNotOnTheList },
                  ],
                },
              ]}
              value={null}
              onSelect={choose}
              searchLabel={COPY.tradedUpSearch}
              emptyText={COPY.tradedUpNoMatch}
            />
          )}

          {otherOpen ? (
            <HelperText>{COPY.tradedUpOtherHelper}</HelperText>
          ) : null}
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );

  /**
   * Today's done and active items, in schedule order, each with the verdict
   * choosing it would produce.
   *
   * A DONE ITEM IS *not counted* AND AN ACTIVE ONE *counts half*, regardless of
   * priority. The resolver's rule is that a traded-up miss is verified when the
   * thing traded to actually got done — priority decides nothing here, and a
   * tail that guessed at it would be a second implementation of the scoring
   * rule living in a picker.
   */
  function tradeCandidates(view: ReviewDay): Array<{
    id: string;
    icon: (typeof view.doneItems)[number]["icon"];
    title: string;
    meta: string;
  }> {
    const rows = [...view.doneItems, ...view.activeItems].sort(
      (a, b) =>
        (a.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY) -
        (b.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY),
    );

    return rows.map((item) => ({
      id: item.id,
      icon: item.icon,
      title: item.title,
      meta:
        item.doneAt === null
          ? COPY.tradedUpMetaRunning(item.priority)
          : COPY.tradedUpMetaDone(
              item.priority,
              formatClock(item.doneAt, zone),
            ),
    }));
  }
}

const OTHER_ID = "__not-on-the-list__";
/** Epic 3 DR-04 — *What was it?* is 1–80. */
const OTHER_MAX = 80;
