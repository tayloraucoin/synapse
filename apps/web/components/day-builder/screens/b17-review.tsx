"use client";

import * as React from "react";

import type { AnchorDirection, SlotView } from "@syn/types";
import { LargeTargetRow, ListRow, Text } from "@syn/ui";

import { SETUP_COPY } from "@/app/(setup)/_components/copy";
import { SlotSheet } from "@/components/block-editor";

import { BuilderSkeleton } from "../builder-skeleton";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { PreviewStrip } from "../preview-strip";
import type { BuilderScreen, DayBuilderApi } from "../use-day-builder";
import { usePlanPreview } from "../use-plan-preview";

/**
 * B17 — the day as it stands (UX v1.3 §4.4 B17, R47, R67; v1.2 §4.13i, 13i
 * renamed by DAY-11).
 *
 * READ-ONLY BUT FOR ONE ROW. `buildPreview` lays the whole day out through
 * `stackBlock` on the client — the same walk DAY-6's materialiser makes, and
 * where they disagree the service is right — and `PreviewStrip` draws it
 * HUED (a planning surface, TD-29): each workout its own band with travel
 * ends, fixtures pinned with theirs, the after-work hand-off, FREE TIME AS A
 * POOL — dashed, *Free time · 5 to choose from*, nothing in it scheduled —
 * and the night beneath lights out. Tap a band → its screen; tap an item →
 * DYN-8's slot sheet for its list.
 *
 * *When the morning runs long* reads the plan's own work's answer; *Change*
 * opens B3's three rows inline and writes `dayPlan.update({ work: {
 * direction } })`. A *No work* plan has no such row.
 */
export function ScreenReview({ api, onGo, disabled }: { api: DayBuilderApi; onGo: (screen: BuilderScreen) => void; disabled: boolean }) {
  const plan = api.plan;
  const { preview, loading, lists, refresh } = usePlanPreview(api);
  const [sheet, setSheet] = React.useState<{ templateId: string; slot: SlotView; slots: readonly SlotView[] } | null>(null);
  const [changing, setChanging] = React.useState(false);
  const [direction, setDirection] = React.useState<AnchorDirection | null>(api.workType?.workDayType?.anchorDirection ?? null);

  if (plan === null) return null;
  if (loading || preview === null) return <BuilderSkeleton />;

  // The tapped item's list — whichever of the plan's five references holds that template.
  const slotsOf = (templateId: string): readonly SlotView[] => {
    const refs = [
      { ref: plan.gettingReady, list: lists.prep },
      { ref: plan.morning, list: lists.morning },
      { ref: plan.windDown, list: lists.windDown },
      { ref: plan.afterWork, list: lists.afterWork },
      { ref: plan.evenings, list: lists.pool },
    ];
    return refs.find((entry) => entry.ref?.templateId === templateId)?.list.slots ?? [];
  };

  const directionWord = direction === null ? COPY.b17.notChosen : SETUP_COPY.gives[direction];

  return (
    <div className="flex flex-col gap-(--space-4)">
      <PreviewStrip
        preview={preview}
        hue
        sleep
        disabled={disabled}
        onGo={onGo}
        onItem={(item) => {
          const slot = item.slot;
          if (slot === undefined) return;
          setSheet({ templateId: slot.templateId, slot: slot.slot, slots: slotsOf(slot.templateId) });
        }}
      />

      {plan.work === null ? null : (
        <div className="flex flex-col gap-(--space-3)">
          <ListRow
            title={COPY.b17.whenMorningRunsLong}
            ariaLabel={COPY.b17.whatGivesLabel(directionWord)}
            onClick={disabled ? undefined : () => setChanging((current) => !current)}
            trailing={
              <span className="flex items-center gap-(--space-2)">
                <Text as="span" variant="secondary" tone="secondary">
                  {directionWord}
                </Text>
                {/* The row is the one button; *Change* is its words, not a second control. */}
                <Text as="span" variant="secondary" weight={500} aria-hidden="true">
                  {COPY.b17.change}
                </Text>
              </span>
            }
          />
          {changing ? (
            <LargeTargetRow
              label={SETUP_COPY.whatGives}
              layout="stacked"
              value={direction}
              disabled={disabled}
              onChange={(value) => {
                const next = value as AnchorDirection;
                setDirection(next);
                setChanging(false);
                void api.patch({ work: { direction: next } }).then(() => api.refreshTemplates());
              }}
              options={[
                { value: "work_waits", label: SETUP_COPY.gives.work_waits, description: SETUP_COPY.gives.work_waitsBody },
                { value: "routine_cut", label: SETUP_COPY.gives.routine_cut, description: SETUP_COPY.gives.routine_cutBody },
                { value: "depends", label: SETUP_COPY.gives.depends, description: SETUP_COPY.gives.dependsBody },
              ]}
              className="[&>span:first-child]:sr-only"
            />
          ) : null}
        </div>
      )}

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
          onChanged={refresh}
        />
      )}
    </div>
  );
}
