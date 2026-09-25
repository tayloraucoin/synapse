"use client";

import * as React from "react";

import { DEVICES_OFF_OFFSET_MIN } from "@syn/constants";
import type { DayPlanPatchInput } from "@syn/validators";
import type { DayPlanView, HabitSummaryView, SlotView, TemplateSummaryView } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { DAY_BUILDER_COPY as COPY } from "./copy";
import { input, minutesOf, toInputClock } from "./clock";

/**
 * The builder's state — UX v1.2 §4.13 (R30, TD-10; RUN-12).
 *
 * ONE PLAN, HELD FROM THE RESPONSE. Every screen writes its part through
 * `dayPlan.update` as it goes, and the plan in state is what the service
 * handed back — so the resolved clocks (the plan's own, or the type's, or
 * the profile's) are always the service's arithmetic, never a second copy.
 * A rejected write keeps the last good plan and says one line.
 *
 * THE PARTS ARE READ HERE ONCE: the profile, the templates of every kind
 * (with `usedBy`), the habits, the fixtures, the orient total. The screens
 * receive slices and callbacks; none of them fetch.
 *
 * NOTHING HERE MATERIALISES. `day_blocks` and `day_items` are never
 * touched; the review (13i) is a client preview through `stackBlock`.
 */

/**
 * The builder's order — UX v1.3 §4.4 (R45; DAY-9): seventeen screens in the
 * order a day happens. The one list; `visibleScreens` says which a plan shows.
 */
export const BUILDER_SCREENS = [
  "b01",
  "b02",
  "b03",
  "b04",
  "b05",
  "b06",
  "b07",
  "b08",
  "b09",
  "b10",
  "b11",
  "b12",
  "b13",
  "b14",
  "b15",
  "b16",
  "b17",
] as const;
export type BuilderScreen = (typeof BUILDER_SCREENS)[number];

/** B8 (first thing), B9–B10 (the landscape, ranked), B15 (free time): the first plan's only. */
const PROFILE_SCREENS: ReadonlySet<BuilderScreen> = new Set(["b08", "b09", "b10", "b15"]);

/**
 * The screens this plan shows — v1.3 §4.4 "Which screens a later day shows".
 * Pure, from the plan's own facts and the profile's answer, never a client
 * flag: the FIRST plan is `sortOrder === 0`; a later plan drops the profile
 * screens, drops B11 when the routine is the same every day, and drops B4
 * when there are no workouts (the first plan keeps B4 for the cards); a *No
 * work* plan drops B13 and B14.
 */
export function visibleScreens(
  plan: { sortOrder: number; work: unknown | null },
  profile: { sameMorningRoutine: boolean | null } | null,
  workouts: number,
): BuilderScreen[] {
  const first = plan.sortOrder === 0;
  const noWork = plan.work === null;
  return BUILDER_SCREENS.filter((screen) => {
    if (!first && PROFILE_SCREENS.has(screen)) return false;
    if (!first && screen === "b04" && workouts === 0) return false;
    if (!first && screen === "b11" && profile?.sameMorningRoutine === true) return false;
    if (noWork && (screen === "b13" || screen === "b14")) return false;
    return true;
  });
}

export type EffectiveTimes = {
  /** "HH:mm" or null when nothing anywhere sets it. */
  wake: string | null;
  workStart: string | null;
  workEnd: string | null;
  lightsOut: string | null;
  devicesOff: string | null;
};

export function useDayBuilder(planId: string) {
  const utils = trpc.useUtils();
  const planQuery = trpc.dayPlan.get.useQuery({ id: planId });
  const me = trpc.user.me.useQuery();
  const templates = trpc.template.list.useQuery({ includeArchived: false });
  const habits = trpc.habit.list.useQuery({ includeArchived: false });
  const fixtures = trpc.fixture.list.useQuery({ includeArchived: false });
  const update = trpc.dayPlan.update.useMutation();

  const [local, setLocal] = React.useState<DayPlanView | null>(null);
  const [line, setLine] = React.useState<string | null>(null);
  const plan = local ?? planQuery.data ?? null;

  const chain = React.useRef<Promise<void>>(Promise.resolve());

  /** One part of the plan; the response is the truth. Returns the moved weekdays, if any. */
  const patch = React.useCallback(
    (part: DayPlanPatchInput): Promise<{ weekday: number; fromPlanName: string }[]> => {
      setLine(null);
      // Ahead of the write, so a stepper's second tap reads the first.
      setLocal((current) => (current === null ? current : { ...current, ...(part as Partial<DayPlanView>) }));
      let moved: { weekday: number; fromPlanName: string }[] = [];
      const run = chain.current
        .catch(() => undefined)
        .then(async () => {
          const result = await update.mutateAsync({ id: planId, patch: part });
          setLocal(result.plan);
          moved = result.moved.map((entry) => ({ weekday: entry.weekday, fromPlanName: entry.fromPlanName }));
          await utils.dayPlan.list.invalidate();
          await utils.dayPlan.get.invalidate({ id: planId });
        })
        .catch(() => {
          setLine(COPY.saveError);
        });
      chain.current = run;
      return run.then(() => moved);
    },
    [planId, update, utils],
  );

  const profile = me.data ?? null;
  const allTemplates = React.useMemo(() => templates.data ?? [], [templates.data]);
  const byKind = React.useCallback(
    (kind: TemplateSummaryView["kind"]) => allTemplates.filter((template) => template.kind === kind),
    [allTemplates],
  );
  const workTypes = React.useMemo(() => byKind("work"), [byKind]);
  const workType = React.useMemo(
    () => (plan?.work === null || plan === null ? null : (workTypes.find((type) => type.id === plan.work?.templateId) ?? null)),
    [plan, workTypes],
  );

  /** The four anchors as the day will have them (TD-21), each "HH:mm" or null. */
  const times: EffectiveTimes = React.useMemo(() => {
    const noWork = plan?.work === null;
    return {
      wake: toInputClock(plan?.wakeClock) ?? toInputClock(profile?.usualWakeTime),
      workStart: noWork ? null : (toInputClock(plan?.workStartClock) ?? toInputClock(profile?.workStartTime)),
      workEnd: noWork ? null : (toInputClock(plan?.workEndClock) ?? toInputClock(profile?.workEndTime)),
      lightsOut: toInputClock(plan?.lightsOutClock) ?? toInputClock(profile?.lightsOutTime),
      // v1.3 §4.4 B2: phone away follows the plan's own lights out until touched (as `resolvePlanAnchors`).
      devicesOff:
        toInputClock(plan?.devicesOffTime) ??
        (plan?.lightsOutTime ? hourBefore(toInputClock(plan.lightsOutTime)) : toInputClock(profile?.devicesOffTimeEffective)),
    };
  }, [plan, profile]);

  const allHabits = React.useMemo(() => habits.data?.habits ?? [], [habits.data?.habits]);
  const habitsOf = React.useCallback(
    (predicate: (habit: HabitSummaryView) => boolean) => allHabits.filter(predicate),
    [allHabits],
  );

  const orientMin = React.useMemo(() => byKind("orient")[0]?.totalMin ?? 0, [byKind]);

  const refreshTemplates = React.useCallback(async () => {
    await utils.template.list.invalidate();
  }, [utils]);

  return {
    plan,
    loading: planQuery.isLoading || me.isLoading || templates.isLoading || habits.isLoading,
    profile,
    times,
    workTypes,
    workType,
    templates: allTemplates,
    byKind,
    habits: allHabits,
    habitsOf,
    fixtures: fixtures.data ?? [],
    orientMin,
    patch,
    line,
    setLine,
    refreshTemplates,
  };
}

export type DayBuilderApi = ReturnType<typeof useDayBuilder>;

/**
 * One template's slots, read for a list screen; `null` while loading, `[]`
 * for no template. Also says when the referenced list is gone (archived).
 */
export function useTemplateSlots(templateId: string | null): {
  slots: SlotView[] | null;
  name: string | null;
  missing: boolean;
  refresh: () => Promise<void>;
} {
  const utils = trpc.useUtils();
  const detail = trpc.template.get.useQuery({ id: templateId ?? "" }, { enabled: templateId !== null, retry: false });
  const refresh = React.useCallback(async () => {
    if (templateId !== null) await utils.template.get.invalidate({ id: templateId });
    await utils.template.list.invalidate();
  }, [utils, templateId]);
  if (templateId === null) return { slots: [], name: null, missing: false, refresh };
  if (detail.isError) return { slots: [], name: null, missing: true, refresh };
  if (!detail.data) return { slots: null, name: null, missing: false, refresh };
  return {
    slots: detail.data.slots,
    name: detail.data.template.name,
    missing: detail.data.template.archived,
    refresh,
  };
}

/** The minutes a list asks of the day: its walk's total. */
export function totalOf(slots: readonly SlotView[]): number {
  return slots
    .filter((slot) => slot.alternates === null || slot.alternates.isDefault)
    .reduce((sum, slot) => sum + slot.durationMin + slot.gapBeforeMin, 0);
}

/** "22:45" → "21:45" — phone away's default, an hour before lights out (v1.2 §4.11). */
export function hourBefore(clock: string | null): string | null {
  const minutes = minutesOf(clock);
  if (minutes === null) return null;
  return input((minutes - DEVICES_OFF_OFFSET_MIN + 24 * 60) % (24 * 60));
}

/** Minutes between two clocks, the second wrapping past midnight when earlier. */
export function between(from: string | null, to: string | null): number | null {
  const a = minutesOf(from);
  const b = minutesOf(to);
  if (a === null || b === null) return null;
  return b >= a ? b - a : b + 24 * 60 - a;
}
