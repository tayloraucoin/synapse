"use client";

import * as React from "react";
import { BackIcon, Button, MonthGrid, Text } from "@syn/ui";
import type { MoveSubject, MoveTarget } from "@/lib/data/move-to";
import { useSetDates } from "@/lib/data/use-move-to";
import { MOVE_TO_COPY as COPY } from "./copy";
import { MoveTargetRow } from "./move-target-row";
import { targetWords } from "./target-words";

/**
 * Pick a day (USE-69; D-USE-37; move-to/states/pick-a-day.md and
 * no-block-of-its-kind.md): the month is `@syn/ui`'s MonthGrid (USE-29's),
 * reused, with past days faded and closed, today ringed and the days
 * already set dotted with the legend. A tapped day shows where it lands and
 * the room left; a day with no block of the item's kind a dashed edge and
 * its line. "Move to <weekday>" is the one primary. No limit on how far
 * ahead [ASSUMPTION, as the index].
 */
export interface PickADayProps {
  scope: React.ReactNode;
  subject: MoveSubject;
  todayKey: string;
  picked: string | null;
  target: MoveTarget | null;
  onPick: (dateKey: string) => void;
  onBack: () => void;
  onMove: (target: MoveTarget, toast: string) => void;
  titleRef: React.Ref<HTMLHeadingElement>;
}

export function PickADay({
  scope,
  subject,
  todayKey,
  picked,
  target,
  onPick,
  onBack,
  onMove,
  titleRef,
}: PickADayProps) {
  const [month, setMonth] = React.useState((picked ?? todayKey).slice(0, 7));
  const setDates = useSetDates(month);
  const isSet = picked !== null && setDates.includes(picked);
  const words =
    target === null ? null : targetWords(target, subject, todayKey, isSet);
  const canMove = target !== null && target.kind !== "none";
  const action =
    picked === null ? COPY.pick.none : COPY.pick.action(picked, todayKey);

  return (
    <div className="flex min-h-full flex-col gap-(--space-3)">
      <div className="flex flex-col gap-(--space-1)">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label={COPY.back(COPY.pick.back)}
          className="-ms-(--space-3) gap-(--space-1) self-start"
        >
          <BackIcon aria-hidden="true" className="size-4" />
          {COPY.pick.back}
        </Button>
        {scope}
        <Text
          as="h2"
          variant="heading"
          ref={titleRef}
          tabIndex={-1}
          className="outline-none"
        >
          {COPY.pick.title}
        </Text>
      </div>

      <MonthGrid
        month={month}
        today={todayKey}
        picked={picked}
        marked={setDates}
        markLabel={COPY.pick.legend}
        minDate={todayKey}
        onMonth={setMonth}
        onPick={onPick}
      />
      <p className="flex items-center gap-(--space-2)">
        <span
          aria-hidden="true"
          className="bg-text-muted size-1 shrink-0 rounded-full"
        />
        <Text as="span" variant="secondary" tone="secondary">
          {COPY.pick.legend}
        </Text>
      </p>

      {words === null || target === null ? null : (
        <div className="border-hairline border-t" aria-live="polite">
          <MoveTargetRow
            label={words.label}
            line={words.line}
            kind={target.kind === "block" ? target.blockKind : undefined}
            dashed={target.kind === "todos" || target.kind === "none"}
          />
        </div>
      )}

      <div className="mt-auto flex flex-col gap-(--space-2) pt-(--space-4)">
        <Button
          size="lg"
          className="w-full"
          disabled={!canMove}
          onClick={() => {
            if (target !== null && words !== null) onMove(target, words.toast);
          }}
        >
          {action}
        </Button>
        <Text
          as="p"
          variant="secondary"
          tone="secondary"
          className="text-center"
        >
          {COPY.pick.under(todayKey)}
        </Text>
      </div>
    </div>
  );
}
