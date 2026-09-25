"use client";

import * as React from "react";

import type { AnchorDirection, WorkDayKind, WorkDays } from "@syn/types";
import { LargeTargetRow, Text } from "@syn/ui";

import { WorkFields } from "@/app/(setup)/_components/work-day-type-card";
import { trpc } from "@/lib/trpc/client";

import { spanLabel, toInputClock } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { between, type DayBuilderApi } from "../use-day-builder";

type Choice = "work" | "none";
type Four = { kind: WorkDayKind | null; workStart: string; workEnd: string; direction: AnchorDirection | null };

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:30";

/**
 * B3 — work on this day (UX v1.3 §4.4 B3, R46, §3.8, TD-23; DAY-9).
 *
 * THE WORK IS THE PLAN'S. *Work* shows the four facts — the kind (its
 * glyph only; the block reads *Work* whatever the kind), *Working by*, *Until
 * about*, *what gives* — and every fact writes `dayPlan.update({ work })`
 * with the full current four; the service creates the plan's own work
 * template on the first and patches it after. *No work on this day* writes
 * `work: null`. Say *type* nowhere; ask which weekdays share these hours
 * nowhere; preselect a kind nowhere.
 *
 * THE PRESELECTION IS COMPUTED ONCE, ON ARRIVAL (§13 #32): the plan's days all
 * *Always* or *Usually* → *Work*; all *Never* → *No work*; mixed, or none →
 * nothing, and *Next* waits. A later plan's hours and *what gives* start from
 * the plan before it (§13 #33); the first plan's *what gives* starts on none.
 * *Work* chosen with no work yet on the plan writes the four at once, so a
 * *Next* straight after it never leaves the plan without its work.
 *
 * `onReady` tells the frame when *Next* may go: *No work*, or *Work* with a
 * *what gives*.
 */
export function ScreenWork({
  api,
  disabled,
  onReady,
}: {
  api: DayBuilderApi;
  disabled: boolean;
  onReady: (ready: boolean) => void;
}) {
  const plan = api.plan;
  const plans = trpc.dayPlan.list.useQuery(undefined);

  // The plan before this one — its hours and its answer seed a later plan (§13 #33).
  const previous = React.useMemo(() => {
    if (plan === null || plan.sortOrder === 0) return null;
    const list = plans.data ?? [];
    const index = list.findIndex((row) => row.id === plan.id);
    const before = (index === -1 ? list : list.slice(0, index)).filter((row) => row.id !== plan.id && row.work !== null);
    const last = before[before.length - 1];
    return last === undefined ? null : (api.workTypes.find((template) => template.id === last.work?.templateId) ?? null);
  }, [plan, plans.data, api.workTypes]);

  const own = api.workType?.workDayType ?? null;
  const seedFrom = own ?? previous?.workDayType ?? null;
  const [four, setFour] = React.useState<Four>(() => ({
    kind: own?.locationKind ?? null,
    workStart: toInputClock(seedFrom?.startClock) ?? DEFAULT_START,
    workEnd: toInputClock(seedFrom?.endClock) ?? DEFAULT_END,
    direction: own?.anchorDirection ?? previous?.workDayType?.anchorDirection ?? null,
  }));

  // Arrival: the plan's own answer if it has one, else the weekdays' (§13 #32), computed once.
  const [choice, setChoice] = React.useState<Choice | null>(() => {
    if (plan === null) return null;
    if (plan.work !== null) return "work";
    if (plan.state === "complete") return "none";
    return preselect(plan.weekdays, api.profile?.workDays ?? null);
  });

  const touched = React.useRef(false);
  const write = React.useCallback(
    async (next: Four) => {
      touched.current = true;
      setFour(next);
      await api.patch({ work: next });
      await api.refreshTemplates();
    },
    [api],
  );

  // The plan before may land after the first paint: its hours and answer seed an untouched later plan.
  const [previousApplied, setPreviousApplied] = React.useState(false);
  React.useEffect(() => {
    if (own !== null || touched.current || previousApplied || previous?.workDayType == null) return;
    const from = previous.workDayType;
    setFour((current) => ({
      ...current,
      workStart: toInputClock(from.startClock) ?? current.workStart,
      workEnd: toInputClock(from.endClock) ?? current.workEnd,
      direction: current.direction ?? from.anchorDirection,
    }));
    setPreviousApplied(true);
  }, [own, previous, previousApplied]);

  // *Work* on arrival with no work on the plan yet: the four, written once — after the plan before is read in.
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (plan === null || seeded.current || disabled || !plans.isSuccess) return;
    if (own === null && previous?.workDayType != null && !previousApplied) return;
    if (choice !== "work" || plan.work !== null) return;
    seeded.current = true;
    void write(four);
  }, [plan, choice, four, write, disabled, plans.isSuccess, own, previous, previousApplied]);

  const ready = choice === "none" || (choice === "work" && four.direction !== null);
  React.useEffect(() => {
    onReady(ready);
  }, [ready, onReady]);

  if (plan === null) return null;

  const before = between(api.times.wake, four.workStart);
  const after = between(four.workEnd, api.times.lightsOut);

  return (
    <div className="flex flex-col gap-(--space-5)">
      <LargeTargetRow
        label={COPY.b03.heading}
        layout="stacked"
        value={choice}
        disabled={disabled}
        onChange={(value) => {
          const next = value as Choice;
          setChoice(next);
          if (next === "none") {
            if (plan.work !== null) void api.patch({ work: null }).then(() => api.refreshTemplates());
          } else if (plan.work === null) {
            seeded.current = true;
            void write(four);
          }
        }}
        options={[
          { value: "work", label: COPY.b03.work },
          { value: "none", label: COPY.b03.noWorkOnThisDay },
        ]}
        className="[&>span:first-child]:sr-only"
      />

      {choice !== "work" ? null : (
        <div className="flex flex-col gap-(--space-5)">
          <WorkFields
            value={four}
            disabled={disabled}
            onKind={(kind) => void write({ ...four, kind })}
            onWorkStart={(workStart) => void write({ ...four, workStart })}
            onWorkEnd={(workEnd) => void write({ ...four, workEnd })}
            onDirection={(direction) => void write({ ...four, direction })}
          />

          <Text as="p" variant="caption" tone="secondary">
            {COPY.b03.foot}
          </Text>

          {before === null || after === null ? null : (
            <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
              {COPY.b03.spans(spanLabel(before), spanLabel(after))}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

/** §13 #32: every day *Always* or *Usually* → *Work*; every day *Never* → *No work*; otherwise nothing. */
export function preselect(weekdays: readonly number[], workDays: WorkDays | null): Choice | null {
  if (weekdays.length === 0 || workDays === null) return null;
  const modes = weekdays.map((weekday) => workDays[String(weekday) as keyof WorkDays]);
  if (modes.every((mode) => mode === "always" || mode === "usually")) return "work";
  if (modes.every((mode) => mode === "never")) return "none";
  return null;
}
