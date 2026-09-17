"use client";

import * as React from "react";

import { Text, TimeField } from "@syn/ui";
import { WORK_DAY_KINDS } from "@syn/constants";
import type { TemplateSummaryView } from "@syn/types";
import { clockToMinutes, formatClockFromMinutes } from "@syn/utils";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";
import { typeStartClock } from "./work-day-type-card";

/**
 * Screen 5 — wake (UX v1.2 §4.5, R39).
 *
 * ONE `TimeField`, *7:00* as value + Change; *Done* closes it and writes
 * `usual_wake_time` at once (save as you go). Under it, "muted, tabular, the
 * first computed consequence: *7:00 to 9:00 · 2 h before work*" — or, with
 * several work-day types, the first type's hours and *on a remote day*.
 *
 * ONE TIME, NOT A RANGE (R39): v1.1's second field "was a question without
 * a purpose"; its column is neither read nor written here and waits for
 * `0009`.
 *
 * NEVER *ALARM*. Nothing here sets a notification.
 */
export function Step5Wake({
  initialWake,
  workStart,
  workTypes,
  embedded = false,
  onSaved,
}: {
  initialWake: string;
  /** The profile's `work_start_time`, for the consequence line. */
  workStart: string | null;
  /** The work-day types; more than one, or one with a kind, names the day. */
  workTypes: TemplateSummaryView[];
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const save = trpc.user.updatePreferences.useMutation();
  const utils = trpc.useUtils();
  const [wake, setWake] = React.useState(initialWake);
  const [committed, setCommitted] = React.useState(initialWake);
  const [line, setLine] = React.useState<string | null>(null);

  // The write follows the picker closing — *Done*, Enter, Escape or blur —
  // and only when the value moved; a reopen-and-close writes nothing.
  async function commit(): Promise<void> {
    if (wake === committed) return;
    setLine(null);
    try {
      await save.mutateAsync({ usualWakeTime: wake });
      setCommitted(wake);
      await utils.user.me.invalidate();
    } catch {
      setLine(COPY.saveError);
    }
  }

  const consequence = React.useMemo(() => {
    const first = workTypes[0] ?? null;
    const typed = workTypes.length > 1 || first?.workDayType?.locationKind != null;
    const start = (typed ? typeStartClock(first) : null) ?? workStart;
    if (start === null) return null;
    const wakeMin = clockToMinutes(wake);
    let workMin = clockToMinutes(start);
    if (workMin < wakeMin) workMin += 24 * 60;
    const wakeText = formatClockFromMinutes(wakeMin);
    const workText = formatClockFromMinutes(workMin % (24 * 60));
    const span = spanLabel(workMin - wakeMin);
    const kindKey = first?.workDayType?.locationKind ?? null;
    const kind = typed && kindKey !== null ? WORK_DAY_KINDS.find((entry) => entry.key === kindKey) : undefined;
    return kind === undefined
      ? COPY.beforeWork(wakeText, workText, span)
      : COPY.beforeWorkOn(wakeText, workText, span, kind.title.toLowerCase());
  }, [wake, workStart, workTypes]);

  return (
    <FactScreen
      step={5}
      heading={COPY.step5Heading}
      body={COPY.step5Body}
      embedded={embedded}
      onSaved={onSaved}
      // Done has written; embedded's *Save* re-sends the same value (harmless), the sequence's Continue nothing.
      save={embedded ? async () => { await save.mutateAsync({ usualWakeTime: wake }); } : null}
    >
      <div className="flex flex-col gap-(--space-4)">
        <div onBlur={() => void commit()}>
          <TimeField
            label={COPY.upAt}
            value={wake}
            onChange={setWake}
            disclosed
            changeLabel={COPY.change}
            doneLabel={COPY.done}
            required
          />
        </div>

        {consequence === null ? null : (
          <Text as="p" variant="secondary" tone="secondary" className="tabular-nums">
            {consequence}
          </Text>
        )}

        {line === null ? null : (
          <Text as="p" variant="secondary">
            {line}
          </Text>
        )}
      </div>
    </FactScreen>
  );
}

/** "2 h" · "1 h 30" · "45 min" */
function spanLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest}`;
}
