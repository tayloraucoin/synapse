"use client";

import * as React from "react";

import type { SlotView } from "@syn/types";

import { BuilderSkeleton } from "../builder-skeleton";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { buildPreview, cutAtWorkEnd } from "../preview";
import { PreviewStrip } from "../preview-strip";
import { useTemplateSlots, type BuilderScreen, type DayBuilderApi } from "../use-day-builder";

/**
 * B7 — so far (UX v1.3 §4.4 B7, R67; DAY-9).
 *
 * THE REVIEW'S STRIP, CUT AT WORK'S END: `buildPreview` — the same client
 * preview through `stackBlock`, never a service — then `cutAtWorkEnd`, drawn
 * by `PreviewStrip` with the kinds' hues (a planning surface, TD-29). Orient,
 * each workout its own band with its travel ends, getting ready, work with
 * its fixtures pinned inside; the routine, before B11 builds it, as an OPEN
 * band — the pooled grammar, labelled *Morning routine · not built yet*. A
 * *No work* day runs to the end of the last block placed so far. Tap a band
 * → its screen; *Next* returns here.
 */
export function ScreenSoFar({
  api,
  disabled,
  onGo,
}: {
  api: DayBuilderApi;
  disabled: boolean;
  onGo: (screen: BuilderScreen) => void;
}) {
  const plan = api.plan;
  const prep = useTemplateSlots(plan?.gettingReady?.templateId ?? null);
  const morning = useTemplateSlots(plan?.morning?.templateId ?? null);

  const preview = React.useMemo(() => {
    if (plan === null) return null;
    const listOf = (ref: { templateId: string } | null, slots: SlotView[] | null) =>
      ref === null || slots === null ? null : { templateId: ref.templateId, slots };
    const whole = buildPreview({
      plan,
      times: api.times,
      orientMin: api.orientMin,
      prep: listOf(plan.gettingReady, prep.slots),
      morning: listOf(plan.morning, morning.slots),
      windDown: null,
      habits: api.habits,
      fixtures: api.fixtures.filter(
        (fixture) =>
          !fixture.archived &&
          !plan.excludedFixtureIds.includes(fixture.id) &&
          fixture.weekdays.some((weekday) => plan.weekdays.includes(weekday)),
      ),
      journalMin: 0,
      openMorning: true,
    });
    return whole === null ? null : cutAtWorkEnd(whole);
  }, [plan, api.times, api.orientMin, api.habits, api.fixtures, prep.slots, morning.slots]);

  if (plan === null) return null;
  if (prep.slots === null || morning.slots === null) return <BuilderSkeleton />;
  if (preview === null) return null;

  return (
    <PreviewStrip
      preview={preview}
      hue
      openLabel={COPY.b07.morningNotBuilt}
      disabled={disabled}
      onGo={onGo}
    />
  );
}
