"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button, HelperText, ScreenFrame, StatusLine, Text } from "@syn/ui";

import { ItemSheet } from "@/components/item-sheet";
import { useOnline } from "@/lib/hooks/use-online";
import { reviewRoute, todayRoute } from "@/lib/routes";

import { REVIEW_COPY as COPY } from "./copy";
import { DecisionColumn } from "./decision-column";
import { Finished } from "./finished";
import { useReviewDay, type ReviewDay } from "./use-review-day";

/**
 * DR-01 and DR-07 — one route, two states.
 *
 * NO PERCENTAGE APPEARS UNTIL THE DECISIONS ARE MADE. That is the ticket's
 * first non-negotiable and the reason this screen is a column of panels rather
 * than a dashboard: a number shown while someone is still deciding would move
 * as they answered, which turns a record into a score being kept.
 *
 * DR-07 IS THIS ROUTE IN A FINISHED STATE, not a second page. Finishing swaps
 * the column for the number, and a reload of a reviewed day lands on the same
 * thing — the day has one address whether it has been reviewed or not.
 *
 * *FINISH LATER* IS A NAVIGATION. Every decision is already written, so there
 * is nothing to save on the way out; the button exists because leaving
 * deliberately should feel different from abandoning.
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

  const callerRoute = from === "list" ? todayRoute() : reviewRoute();

  if (day.result !== null) {
    return <Finished day={day} onDone={() => router.replace(callerRoute)} />;
  }

  const nothingAssigned = day.summary.assigned === 0;
  const everythingDone = !nothingAssigned && day.toDecide.length === 0;

  return (
    <ScreenFrame prose>
      <div className="flex flex-col gap-(--space-5)">
        {!online ? <StatusLine variant="offline" placement="inline" /> : null}

        <Text as="p" tone="secondary">
          {nothingAssigned
            ? COPY.nothingAssignedToday
            : everythingDone
              ? COPY.everyItemWasDone
              : COPY.summary(day.summary)}
        </Text>

        <DecisionColumn
          day={day}
          reasons={review.reasons?.byTier ?? null}
          onDecide={review.decide}
          onOpenItem={setOpenItemId}
        />

        {review.error === null ? null : (
          <HelperText error>{review.error}</HelperText>
        )}

        {/*
         * Sticky above the safe area on compact; static at the column's end on
         * wide, where there is no thumb reach to design around.
         */}
        <div className="bg-paper sticky bottom-0 flex items-center justify-between gap-(--space-3) pt-(--space-4) pb-[calc(var(--space-4)+env(safe-area-inset-bottom))] wide:static wide:pb-(--space-4)">
          <Button
            variant="ghost"
            onClick={() => router.replace(callerRoute)}
          >
            {COPY.finishLater}
          </Button>
          <Button
            busy={review.finishing}
            // The undecided panels are the explanation; a sentence saying how
            // many are left would repeat what the screen already shows.
            disabled={!review.canFinish || !online}
            onClick={() => review.finish(() => undefined)}
          >
            {COPY.finishReview}
          </Button>
        </div>
      </div>

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
