"use client";

import * as React from "react";

import type { SlotView } from "@syn/types";

import { buildPreview } from "./preview";
import { JOURNAL_MIN } from "./screens/b12-wind-down";
import { useTemplateSlots, type DayBuilderApi } from "./use-day-builder";

/**
 * The plan's whole day as the builder previews it — every list's slots read
 * once and handed to `buildPreview` (UX v1.3 R67; DAY-11). B13, B14, B16 and
 * B17 draw their strips (and B16 its evening room) from this one call, so no
 * two screens lay the day out differently. NOTHING HERE WRITES.
 *
 * `loading` is true while any list the plan references is still out, so a
 * screen shows its skeleton rather than a strip missing a block.
 */
export function usePlanPreview(api: DayBuilderApi, options: { openEvening?: boolean } = {}) {
  const plan = api.plan;
  const prep = useTemplateSlots(plan?.gettingReady?.templateId ?? null);
  const morning = useTemplateSlots(plan?.morning?.templateId ?? null);
  const windDown = useTemplateSlots(plan?.windDown?.templateId ?? null);
  const afterWork = useTemplateSlots(plan?.afterWork?.templateId ?? null);
  const pool = useTemplateSlots(plan?.evenings?.templateId ?? null);
  const journalOn = api.profile?.journalEnabled ?? true;
  const openEvening = options.openEvening === true;

  const preview = React.useMemo(() => {
    if (plan === null) return null;
    const listOf = (ref: { templateId: string } | null, slots: SlotView[] | null) =>
      ref === null || slots === null ? null : { templateId: ref.templateId, slots };
    return buildPreview({
      plan,
      times: api.times,
      orientMin: api.orientMin,
      prep: listOf(plan.gettingReady, prep.slots),
      morning: listOf(plan.morning, morning.slots),
      windDown: listOf(plan.windDown, windDown.slots),
      afterWork: listOf(plan.afterWork, afterWork.slots),
      pool: listOf(plan.evenings, pool.slots),
      habits: api.habits,
      fixtures: api.fixtures.filter(
        (fixture) =>
          !fixture.archived &&
          !plan.excludedFixtureIds.includes(fixture.id) &&
          fixture.weekdays.some((weekday) => plan.weekdays.includes(weekday)),
      ),
      journalMin: journalOn ? JOURNAL_MIN : 0,
      openEvening,
    });
  }, [plan, api.times, api.orientMin, api.habits, api.fixtures, prep.slots, morning.slots, windDown.slots, afterWork.slots, pool.slots, journalOn, openEvening]);

  const lists = { prep, morning, windDown, afterWork, pool };
  const loading = Object.values(lists).some((list) => list.slots === null);
  const refresh = React.useCallback(async () => {
    await Promise.all([prep.refresh(), morning.refresh(), windDown.refresh(), afterWork.refresh(), pool.refresh()]);
  }, [prep, morning, windDown, afterWork, pool]);

  return { preview, loading, lists, refresh };
}
