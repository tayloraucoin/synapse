"use client";

import * as React from "react";

import type { DayPlanPatchInput } from "@syn/validators";
import type { DayPlanView, HabitSummaryView, SlotView, TemplateSummaryView } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { DAY_BUILDER_COPY as COPY } from "./copy";
import { minutesOf, toInputClock } from "./clock";

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

export const BUILDER_SCREENS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"] as const;
export type BuilderScreen = (typeof BUILDER_SCREENS)[number];

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
      devicesOff: toInputClock(plan?.devicesOffTime) ?? toInputClock(profile?.devicesOffTimeEffective),
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

/** Minutes between two clocks, the second wrapping past midnight when earlier. */
export function between(from: string | null, to: string | null): number | null {
  const a = minutesOf(from);
  const b = minutesOf(to);
  if (a === null || b === null) return null;
  return b >= a ? b - a : b + 24 * 60 - a;
}
