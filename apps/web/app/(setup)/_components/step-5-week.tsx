"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import type { DayPlanSummaryView, MorningMode, Weekday, WorkDays } from "@syn/types";
import { Button, EmojiSlot, LargeTargetRow, ListRow, PickerList, ResponsiveSheet, Text, WeekHueStrip } from "@syn/ui";

import { SheetHost } from "@/components/page-frame";
import { WEEKDAY_LONG, segmentsOf, summaryOf } from "@/components/day-builder";
import { useOnline } from "@/lib/hooks/use-online";
import { homeRoute, settingsWeekRoute, setupRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { StepFrame, useStepNavigation } from "./step-frame";

/**
 * Screen 5 — *Your usual week* and the mode question (UX v1.3 §4.5; v1.2
 * §4.14's screen 14, RUN-13, renumbered by DAY-8; the hue strips are DAY-12's).
 *
 * SEVEN ROWS, NO NUMBER ABOUT THE WEEK. Each weekday reads its complete
 * plan, or *Off* when the profile says *never* / *rarely* and no plan holds
 * it, or *Unstructured*. A tap opens the picker: choosing a plan writes
 * `dayPlan.update({ weekdays })` on it (the service takes the day from
 * whichever plan held it — one weekday, one plan); *Unstructured* clears the
 * day from its plan. *Edit Day A* returns to screen 4's builder on that
 * plan's review. Under a planned row's line, the plan's blocks as a thin
 * hued strip (`WeekHueStrip`, v1.3 §13 #36; DAY-12) — a picture beside the
 * words, never the only carrier; *Off* and *Unstructured* rows have none.
 *
 * ONE QUESTION, ALREADY ANSWERED BY DEFAULT: *Set from the plan* is
 * preselected. Both primaries write the mode and complete first run in one
 * call (`completeFirstRun({ morningMode })`, which pre-fills the current
 * week from the plans); *Open today* then lets the entry tree decide —
 * `/orient` while today has no `woke_at`, else `/today`; *Plan this week
 * first* lands on the week build.
 */
export function Step5Week({
  initialWorkDays,
  initialMode,
}: {
  initialWorkDays: WorkDays | null;
  initialMode: MorningMode;
}) {
  const router = useRouter();
  const online = useOnline();
  const goTo = useStepNavigation();
  const utils = trpc.useUtils();
  const plans = trpc.dayPlan.list.useQuery({ state: "complete" });
  const update = trpc.dayPlan.update.useMutation();
  const complete = trpc.user.completeFirstRun.useMutation();

  const [mode, setMode] = React.useState<MorningMode>(initialMode);
  const [open, setOpen] = React.useState<Weekday | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [finishing, setFinishing] = React.useState<"today" | "week" | null>(null);

  const list = React.useMemo(() => plans.data ?? [], [plans.data]);
  // The strips' lengths: orient's template and the workouts' own (v1.3 §13 #36) — no new procedure.
  const orientList = trpc.template.list.useQuery({ includeArchived: false, kind: "orient" });
  const workouts = trpc.habit.list.useQuery({ includeArchived: false, types: ["workout"] });
  const orientMin = orientList.data?.[0]?.totalMin ?? 0;
  const workoutMin = React.useCallback(
    (habitId: string) => workouts.data?.habits.find((habit) => habit.id === habitId)?.durationMin ?? 30,
    [workouts.data?.habits],
  );
  const planFor = (weekday: Weekday): DayPlanSummaryView | null =>
    list.find((plan) => plan.weekdays.includes(weekday)) ?? null;
  const modeOf = (weekday: Weekday) => initialWorkDays?.[String(weekday) as keyof WorkDays] ?? (weekday < 5 ? "always" : "never");
  const wordFor = (weekday: Weekday): string => {
    const plan = planFor(weekday);
    if (plan !== null) return plan.name;
    const work = modeOf(weekday);
    return work === "never" || work === "rarely" ? COPY.off : COPY.unstructured;
  };

  const choose = async (weekday: Weekday, planId: string | null) => {
    setError(null);
    setOpen(null);
    try {
      const current = planFor(weekday);
      if (planId === null) {
        if (current !== null) {
          await update.mutateAsync({ id: current.id, patch: { weekdays: current.weekdays.filter((day) => day !== weekday) } });
        }
      } else if (current?.id !== planId) {
        const target = list.find((plan) => plan.id === planId);
        if (target === undefined) return;
        await update.mutateAsync({
          id: target.id,
          patch: { weekdays: [...target.weekdays, weekday].sort((a, b) => a - b) },
        });
      }
      await utils.dayPlan.list.invalidate();
    } catch {
      setError(COPY.saveError);
    }
  };

  const finish = async (then: "today" | "week") => {
    setError(null);
    setFinishing(then);
    try {
      await complete.mutateAsync({ morningMode: mode });
      await utils.user.me.invalidate();
      router.replace(then === "today" ? homeRoute() : settingsWeekRoute());
    } catch {
      setError(COPY.saveError);
      setFinishing(null);
    }
  };

  const openPlan = open === null ? null : planFor(open);

  return (
    <StepFrame
      step={5}
      heading={COPY.weekHeading}
      error={error}
      primary={{
        label: COPY.openToday,
        onClick: () => void finish("today"),
        busy: finishing === "today",
        disabled: finishing !== null,
      }}
      skip={{
        label: COPY.planWeekFirst,
        onSkip: () => void finish("week"),
        busy: finishing === "week",
      }}
    >
      <div className="flex flex-col gap-(--space-6)">
        <ul className="m-0 flex list-none flex-col p-0">
          {([0, 1, 2, 3, 4, 5, 6] as Weekday[]).map((weekday) => {
            const plan = planFor(weekday);
            const word = wordFor(weekday);
            // v1.3 §4.5, §13 #36 (DAY-12): the plan's blocks as a thin hued strip under its line — a picture, aria-hidden.
            const segments = plan === null ? [] : segmentsOf(plan, { orientMin, workoutMin });
            return (
              <li key={weekday} className="flex flex-col">
              <ListRow
                as="div"
                title={WEEKDAY_LONG[weekday]}
                ariaLabel={COPY.weekRowLabel(WEEKDAY_LONG[weekday] ?? "", word)}
                onClick={online ? () => setOpen(weekday) : undefined}
                trailing={
                  <span className="flex min-w-0 items-center gap-(--space-2)">
                    {plan === null ? null : <EmojiSlot icon={plan.icon} />}
                    <Text as="span" variant="secondary" tone="secondary" truncate className="tabular-nums">
                      {plan === null
                        ? word
                        : [plan.name, ...summaryOf(plan).slice(1).map((part) => part.text)].join(" · ")}
                    </Text>
                  </span>
                }
              />
              {segments.length === 0 ? null : (
                <div className="px-(--space-4) pb-(--space-2)">
                  <WeekHueStrip segments={segments} />
                </div>
              )}
              </li>
            );
          })}
        </ul>

        <LargeTargetRow
          label={COPY.morningMode}
          layout="stacked"
          value={mode}
          onChange={(value) => setMode(value as MorningMode)}
          disabled={!online || finishing !== null}
          options={[
            { value: "set_from_plan", label: COPY.setFromPlan, description: COPY.setFromPlanBody },
            { value: "build_each_morning", label: COPY.buildEachMorning, description: COPY.buildEachMorningBody },
          ]}
        />
      </div>

      <SheetHost open={open !== null}>
        <ResponsiveSheet
          open={open !== null}
          onOpenChange={(next) => {
            if (!next) setOpen(null);
          }}
          title={open === null ? "" : COPY.whichPlan(WEEKDAY_LONG[open] ?? "")}
          footer={
            openPlan === null ? undefined : (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => void goTo(4, setupRoute(4, { edit: openPlan.id }), "other")}
              >
                {COPY.editPlan(openPlan.name)}
              </Button>
            )
          }
        >
          {open === null ? null : (
            <PickerList
              groups={[
                {
                  heading: COPY.yourDays,
                  items: list.map((plan) => ({
                    id: plan.id,
                    title: plan.name,
                    icon: plan.icon ?? undefined,
                    meta: plan.weekdays.map((day) => WEEKDAY_LONG[day]?.slice(0, 3)).join(" · "),
                  })),
                },
              ]}
              value={openPlan?.id ?? null}
              noneLabel={COPY.unstructured}
              onSelect={(id) => void choose(open, id === "" ? null : id)}
              searchLabel={COPY.searchPlans}
              emptyText={COPY.noPlansMatch}
              presentation="inline"
            />
          )}
        </ResponsiveSheet>
      </SheetHost>
    </StepFrame>
  );
}
