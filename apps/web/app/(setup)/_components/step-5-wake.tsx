"use client";

import * as React from "react";

import { Button, Text, TimeField } from "@syn/ui";
import { clockToMinutes, formatClockFromMinutes } from "@syn/utils";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 5 — wake (UX v1.1 §4.5).
 *
 * One `TimeField`, *7:00* as value + Change. *Add an earliest* is ghost text
 * that reveals a second field for the person whose wake is a range; the
 * range is informational in v1.1 (§13 #6). Under the field, "the first
 * computed consequence in the flow, muted, tabular: *7:00 to 9:00 · 2 h
 * before work.*" — from the profile's work start, absent when there is none.
 *
 * NEVER *ALARM*. Nothing here sets a notification.
 */
export function Step5Wake({
  initialWake,
  initialEarliest,
  workStart,
  embedded = false,
  onSaved,
}: {
  initialWake: string;
  initialEarliest: string | null;
  /** The profile's `work_start_time`, for the consequence line. */
  workStart: string | null;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const save = trpc.user.updatePreferences.useMutation();
  const [wake, setWake] = React.useState(initialWake);
  const [earliest, setEarliest] = React.useState<string | null>(initialEarliest);
  const [earliestShown, setEarliestShown] = React.useState(initialEarliest !== null);
  const earliestRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (earliestShown && earliest === null) {
      earliestRef.current?.querySelector<HTMLElement>("button, input")?.focus();
    }
  }, [earliestShown, earliest]);

  const consequence = React.useMemo(() => {
    if (workStart === null) return null;
    const wakeMin = clockToMinutes(wake);
    let workMin = clockToMinutes(workStart);
    if (workMin < wakeMin) workMin += 24 * 60;
    return COPY.beforeWork(
      formatClockFromMinutes(wakeMin),
      formatClockFromMinutes(workMin % (24 * 60)),
      spanLabel(workMin - wakeMin),
    );
  }, [wake, workStart]);

  return (
    <FactScreen
      step={5}
      heading={COPY.step5Heading}
      embedded={embedded}
      onSaved={onSaved}
      save={async () => {
        await save.mutateAsync({
          usualWakeTime: wake,
          earliestWakeTime: earliestShown ? earliest : null,
        });
      }}
    >
      <div className="flex flex-col gap-(--space-4)">
        <TimeField
          label={COPY.upAt}
          value={wake}
          onChange={setWake}
          disclosed
          changeLabel={COPY.change}
          required
        />

        {earliestShown ? (
          <div ref={earliestRef}>
            <TimeField
              label={COPY.earliest}
              value={earliest ?? "06:30"}
              onChange={setEarliest}
              disclosed={earliest !== null}
              changeLabel={COPY.change}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            className="self-start"
            onClick={() => {
              setEarliestShown(true);
              setEarliest("06:30");
            }}
          >
            {COPY.addAnEarliest}
          </Button>
        )}

        {consequence === null ? null : (
          <Text as="p" variant="secondary" tone="secondary" className="tabular-nums">
            {consequence}
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
