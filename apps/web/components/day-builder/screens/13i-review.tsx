"use client";

import * as React from "react";

import type { SlotView } from "@syn/types";

import { SlotSheet } from "@/components/block-editor";

import { buildPreview } from "../preview";
import { PreviewStrip } from "../preview-strip";
import { useTemplateSlots, type BuilderScreen, type DayBuilderApi } from "../use-day-builder";
import { JOURNAL_MIN } from "./13h-wind-down";

/**
 * 13i — the day as it stands (UX v1.2 §4.13i), B17 until DAY-11 rebuilds it.
 *
 * READ-ONLY. `buildPreview` lays the plan's parts out through `stackBlock`
 * on the client and `PreviewStrip` draws it (DAY-9 moved the drawing there so
 * B7's cut is the same strip); nothing here writes a block or an item. Tap a
 * band → its screen; tap an item → DYN-8's slot sheet for its list.
 */
export function ScreenReview({ api, onGo, disabled }: { api: DayBuilderApi; onGo: (screen: BuilderScreen) => void; disabled: boolean }) {
  const plan = api.plan;
  const prep = useTemplateSlots(plan?.gettingReady?.templateId ?? null);
  const morning = useTemplateSlots(plan?.morning?.templateId ?? null);
  const windDown = useTemplateSlots(plan?.windDown?.templateId ?? null);
  const [sheet, setSheet] = React.useState<{ templateId: string; slot: SlotView; slots: readonly SlotView[] } | null>(null);

  const journalOn = api.profile?.journalEnabled ?? true;
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
      habits: api.habits,
      fixtures: api.fixtures.filter((fixture) => !fixture.archived && !plan.excludedFixtureIds.includes(fixture.id) && fixture.weekdays.some((weekday) => plan.weekdays.includes(weekday))),
      journalMin: journalOn ? JOURNAL_MIN : 0,
    });
  }, [plan, api.times, api.orientMin, api.habits, api.fixtures, prep.slots, morning.slots, windDown.slots, journalOn]);

  if (plan === null || preview === null) return null;

  return (
    <div className="flex flex-col gap-(--space-4)">
      <PreviewStrip
        preview={preview}
        disabled={disabled}
        onGo={onGo}
        onItem={(item) => {
          const slot = item.slot;
          if (slot === undefined) return;
          const slots = slot.templateId === plan.gettingReady?.templateId ? prep.slots : slot.templateId === plan.morning?.templateId ? morning.slots : windDown.slots;
          setSheet({ templateId: slot.templateId, slot: slot.slot, slots: slots ?? [] });
        }}
      />

      {sheet === null ? null : (
        <SlotSheet
          open
          templateId={sheet.templateId}
          structure="stack"
          slot={sheet.slot}
          slots={sheet.slots}
          onOpenChange={(open) => {
            if (!open) setSheet(null);
          }}
          onChanged={async () => {
            await Promise.all([prep.refresh(), morning.refresh(), windDown.refresh()]);
          }}
        />
      )}
    </div>
  );
}
