"use client";

import {
  BigNumber,
  Button,
  FactLine,
  FormulaSentence,
  ScreenFrame,
} from "@syn/ui";

import { REVIEW_COPY as COPY } from "./copy";
import type { ReviewDay } from "./use-review-day";

/**
 * DR-07 — the number, and everything that produced it.
 *
 * THE NUMBER NEVER APPEARS WITHOUT ITS SENTENCE (official spec §0.3 R6). They
 * are adjacent and grouped for assistive technology as one region, so the
 * percent is never read alone — hearing "86 percent" without "9 done, 1
 * planned wrong" is the number without the thing that makes it fair.
 *
 * THE FACT LINES ARE FACTS. *Off-schedule: 2 of 9 done.* is a count of when
 * things happened, not a comment on it; *1 carried to tomorrow.* is a
 * statement about tomorrow's list. None of them is a verdict, and none of them
 * appears when its count is zero — a line reading *0 carried to tomorrow.*
 * would be the screen reporting an absence as an event.
 */
export function Finished({
  day,
  onDone,
}: {
  day: ReviewDay;
  onDone: () => void;
}) {
  const result = day.result;
  if (result === null) return null;

  // A band with nothing in it is omitted from the line entirely — printing
  // "low (1–2): 0 of 0" would report an absence as a result.
  const bands: Array<{ label: string; credit: number; counted: number }> = [];
  for (const entry of [
    { label: COPY.bandHigh as string, band: result.bands.high },
    { label: COPY.bandMid as string, band: result.bands.mid },
    { label: COPY.bandLow as string, band: result.bands.low },
  ]) {
    if (entry.band === null) continue;
    bands.push({
      label: entry.label,
      credit: entry.band.credit,
      counted: entry.band.counted,
    });
  }

  const shiftedTotal = day.shifts.reduce(
    (total, shift) => total + shift.deltaMin,
    0,
  );
  const carried = day.toDecide.filter(
    (entry) => entry.item.state === "carried",
  ).length;

  return (
    <ScreenFrame prose>
      <div className="flex flex-col gap-(--space-5)">
        {/*
         * One region, so the number and its sentence are announced together.
         */}
        <section
          aria-label={`${result.percent ?? 0}%`}
          className="flex flex-col gap-(--space-2)"
        >
          <BigNumber value={result.percent} size="day" />
          <FormulaSentence
            terms={result.terms}
            credit={result.credit}
            counted={result.counted}
            percent={result.percent}
          />
        </section>

        <div className="flex flex-col gap-(--space-1)">
          {result.offSchedule.moved > 0 ? (
            <FactLine>
              {COPY.offScheduleFact(
                result.offSchedule.moved,
                result.offSchedule.done,
              )}
            </FactLine>
          ) : null}

          {bands.length > 0 ? (
            <FactLine>{COPY.byPriority(bands)}</FactLine>
          ) : null}

          {day.shifts.length > 0 ? (
            <FactLine>
              {COPY.shiftedFact(shiftedTotal, day.shifts.length)}
            </FactLine>
          ) : null}

          {carried > 0 ? (
            <FactLine>{COPY.carriedFact(carried)}</FactLine>
          ) : null}

          {day.summary.notAssigned > 0 ? (
            <FactLine>{COPY.notAssignedFact(day.summary.notAssigned)}</FactLine>
          ) : null}
        </div>

        <Button className="self-start" onClick={onDone}>
          {COPY.done}
        </Button>
      </div>
    </ScreenFrame>
  );
}
