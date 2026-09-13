"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  Button,
  DiscardDialog,
  HelperText,
  ScreenFrame,
  StatusLine,
  Text,
} from "@syn/ui";

import { ConfirmYesterdayPanel } from "@/components/confirm-yesterday";
import { ItemSheet } from "@/components/item-sheet";
import { useOnline } from "@/lib/hooks/use-online";
import { reviewRoute, todayRoute } from "@/lib/routes";

import { REVIEW_COPY as COPY } from "./copy";
import { DecisionColumn } from "./decision-column";
import { Finished } from "./finished";
import { TradedUpSheet } from "./traded-up-sheet";
import { useReviewDay, type ReviewDay } from "./use-review-day";

/**
 * DR-01 and DR-07 — one route, three states.
 *
 * NO PERCENTAGE APPEARS UNTIL THE DECISIONS ARE MADE. That is the ticket's
 * first non-negotiable and the reason this screen is a column of panels rather
 * than a dashboard: a number shown while someone is still deciding would move
 * as they answered, which turns a record into a score being kept.
 *
 * DR-07 IS THIS ROUTE IN A FINISHED STATE, not a second page — but only just
 * after finishing or saving. **A reviewed day opened by URL shows EDIT MODE,
 * not the number** (Epic 3 DR-01 edit mode): the number is one line and the
 * record is the thing worth arriving at, so coming back to a past review lands
 * on what happened with a way to correct it, rather than on a score with a way
 * to dismiss it.
 *
 * *FINISH LATER* IS A NAVIGATION IN LIVE MODE and a discard prompt in edit
 * mode, for the one reason that separates the two: live decisions are already
 * written, and edit-mode changes are not.
 */
export function ReviewDayScreen({
  dateKey,
  initial,
  from,
}: {
  dateKey: string;
  initial: ReviewDay;
  /** *Day Complete* on the List sends people back to the List. */
  from: "list" | null;
}) {
  const router = useRouter();
  const online = useOnline();
  const review = useReviewDay(dateKey, initial);
  const { day } = review;

  const [openItemId, setOpenItemId] = React.useState<string | null>(null);
  const [tradedUpFor, setTradedUpFor] = React.useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  /*
   * UX v1.1 §7.3: the *Last night* rows are never pre-ticked; the panel holds
   * the ticks until *Confirm* writes them. Cleared once the day comes back
   * without the rows.
   */
  const [lastNightTicked, setLastNightTicked] = React.useState<Set<string>>(
    () => new Set(),
  );
  /*
   * DR-07 is shown for the moment AFTER finishing or saving, and not on a
   * fresh load — which is why this is state rather than derived from the day.
   * `day.result !== null` is true of every reviewed day forever.
   */
  const [justSettled, setJustSettled] = React.useState(false);

  /*
   * The reflection section's note flush, handed up when it mounts. Finishing
   * or saving has to write a half-typed note before it reads the day back,
   * or the note the person is looking at would disappear on re-render.
   */
  const flushRef = React.useRef<(() => Promise<void>) | null>(null);
  const registerReflectionFlush = React.useCallback(
    (flush: () => Promise<void>) => {
      flushRef.current = flush;
    },
    [],
  );

  const callerRoute = from === "list" ? todayRoute() : reviewRoute();

  function leave(): void {
    router.replace(callerRoute);
  }

  if (justSettled && day.result !== null) {
    return <Finished day={day} onDone={leave} />;
  }

  const editing = review.editing;
  const nothingAssigned = day.summary.assigned === 0;
  const everythingDone = !nothingAssigned && day.toDecide.length === 0;

  function requestLeave(): void {
    // Only a dirty batch has anything to lose. A clean edit-mode screen leaves
    // the same way a live one does.
    if (editing && review.dirty) {
      setDiscardOpen(true);
      return;
    }
    leave();
  }

  return (
    <ScreenFrame prose>
      <div className="flex flex-col gap-(--space-5)">
        {!online ? <StatusLine variant="offline" placement="inline" /> : null}

        <Text as="p" tone="secondary">
          {editing
            ? subtitleFor(day)
            : nothingAssigned
              ? COPY.nothingAssignedToday
              : everythingDone
                ? COPY.everyItemWasDone
                : COPY.summary(day.summary)}
        </Text>

        {/* UX v1.1 §8.1: the morning's intention, read back in serif. */}
        {day.intention === null ? null : (
          <Text as="p" variant="review-sentence" tone="secondary">
            {COPY.intention(day.intention)}
          </Text>
        )}

        {/*
         * §7.3: a day whose after-devices-off items were never confirmed
         * shows them first — the same rows as the quick-pick, and one
         * *Confirm*. Never pre-ticked; never asks why.
         */}
        {day.lastNight.length === 0 ? null : (
          <section className="flex flex-col gap-(--space-3)">
            <Text as="h2" variant="row-title">
              {COPY.lastNight}
            </Text>
            <ConfirmYesterdayPanel
              items={day.lastNight}
              ticked={lastNightTicked}
              showCaption={false}
              disabled={review.confirmingLastNight}
              onToggle={(id, on) =>
                setLastNightTicked((current) => {
                  const next = new Set(current);
                  if (on) next.add(id);
                  else next.delete(id);
                  return next;
                })
              }
            />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                busy={review.confirmingLastNight}
                disabled={!online}
                onClick={() => {
                  review.confirmLastNight([...lastNightTicked]);
                  setLastNightTicked(new Set());
                }}
              >
                {COPY.confirm}
              </Button>
            </div>
          </section>
        )}

        <DecisionColumn
          day={day}
          reasons={review.reasons?.byTier ?? null}
          batch={review.batch}
          editing={editing}
          onDecide={review.decide}
          onOpenItem={setOpenItemId}
          onTradedUp={setTradedUpFor}
          onReflectionChanged={() => void review.refresh()}
          registerReflectionFlush={registerReflectionFlush}
        />

        {review.error === null ? null : (
          <HelperText error>{review.error}</HelperText>
        )}

        {/*
         * Sticky above the safe area on compact; static at the column's end on
         * wide, where there is no thumb reach to design around.
         */}
        <div className="bg-paper sticky bottom-0 flex items-center justify-between gap-(--space-3) pt-(--space-4) pb-[calc(var(--space-4)+env(safe-area-inset-bottom))] wide:static wide:pb-(--space-4)">
          <Button variant="ghost" onClick={requestLeave}>
            {COPY.finishLater}
          </Button>
          {editing ? (
            <Button
              busy={review.saving}
              // The clean state IS the explanation: nothing has changed, so
              // there is nothing to save.
              disabled={!review.dirty || !online}
              onClick={() => {
                void flushRef.current?.();
                review.saveChanges(() => setJustSettled(true));
              }}
            >
              {COPY.saveChanges}
            </Button>
          ) : (
            <Button
              busy={review.finishing}
              // The undecided panels are the explanation; a sentence saying how
              // many are left would repeat what the screen already shows.
              disabled={!review.canFinish || !online}
              onClick={() => {
                void flushRef.current?.();
                review.finish(() => setJustSettled(true));
              }}
            >
              {COPY.finishReview}
            </Button>
          )}
        </div>
      </div>

      <TradedUpSheet
        open={tradedUpFor !== null}
        day={day}
        onOpenChange={(next) => {
          if (!next) setTradedUpFor(null);
        }}
        onChoose={(decision) => {
          if (tradedUpFor !== null) review.decide(tradedUpFor, decision);
          setTradedUpFor(null);
        }}
      />

      <DiscardDialog
        open={discardOpen}
        onKeepEditing={() => setDiscardOpen(false)}
        onDiscard={() => {
          review.discardChanges();
          setDiscardOpen(false);
          leave();
        }}
      />

      {/* USE-3's sheet, over this route — the *edit* link on a done row. */}
      <ItemSheet
        open={openItemId !== null}
        itemId={openItemId}
        dayKey={dateKey}
        onOpenChange={(next) => {
          if (!next) {
            setOpenItemId(null);
            void review.refresh();
          }
        }}
      />
    </ScreenFrame>
  );
}

/** *Reviewed {when}* · *edited {when}* — DR-01 in edit mode, DR-07's line. */
function subtitleFor(day: ReviewDay): string {
  const parts = [
    COPY.reviewedWhen(relativeDay(day.reviewedAt, day.dateKey)),
    ...(day.reviewEditedAt === null
      ? []
      : [COPY.editedWhen(relativeDay(day.reviewEditedAt, day.dateKey))]),
  ];
  return parts.join(" · ");
}

/**
 * *today* · *yesterday* · a weekday · a date.
 *
 * The review is read within days of the thing it describes, so a weekday is
 * more useful than a date for the first week and less useful after it. Nothing
 * older than a week gets a weekday, because "Thursday" three weeks ago is a
 * word that means nothing.
 */
function relativeDay(at: Date | null, dateKey: string): string {
  if (at === null) return dateKey;

  const stamp = new Date(at);
  const days = Math.floor(
    (Date.now() - stamp.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) {
    return stamp.toLocaleDateString(undefined, { weekday: "long" });
  }
  return stamp.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
