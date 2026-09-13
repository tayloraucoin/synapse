"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { BlockBand, LargeTargetRow, SCHEDULE_GUTTER_PX, ScheduleAxis, SkeletonBlock, Text } from "@syn/ui";
import type { OverflowMode } from "@syn/types";

import { trpc } from "@/lib/trpc/client";
import { settingsWeekRoute, todayRoute } from "@/lib/routes";

import { SETUP_COPY as COPY } from "./copy";
import { StepFrame } from "./step-frame";

/**
 * Screen 12 — The fit (UX v1.1 §4.12, §3.10).
 *
 * "Show the computed consequence of everything entered, and let the person
 * choose how the days that don't fit will be handled." The strip is the
 * Schedule's own axis with four bands — orient, the routine's available
 * span (lighter), prep, and work at its start; the sentence is the number as
 * a fact; the three rows are three honest ways to live with it, the daily
 * menu preselected. When it fits, one line and no rows.
 *
 * ONE PRIMARY. *Open today* is the primary; *Plan this week first* is the
 * ghost beside it (two primaries are not allowed). Both write the mode, mark
 * first run complete — which pre-fills the week (§4.13) — and land. The
 * orient frame is DYN-13's landing; until it ships, Today.
 */

const PX_PER_HOUR = 64;

export function Step12Fit() {
  const router = useRouter();
  const fit = trpc.template.fit.useQuery();
  const complete = trpc.user.completeFirstRun.useMutation();
  const [mode, setMode] = React.useState<OverflowMode>("daily_menu");
  const [error, setError] = React.useState<string | null>(null);

  const data = fit.data;
  const over = data !== undefined && data.workStartMin !== null && !data.fits;

  async function finish(then: string): Promise<void> {
    setError(null);
    try {
      await complete.mutateAsync({ overflowMode: over ? mode : "daily_menu" });
      router.replace(then);
    } catch {
      setError(COPY.saveError);
    }
  }

  return (
    <StepFrame
      step={12}
      heading={COPY.step12Heading}
      error={error}
      primary={{
        label: COPY.openToday,
        onClick: () => void finish(todayRoute()),
        busy: complete.isPending,
        disabled: fit.isLoading,
      }}
      skip={{
        label: COPY.planWeekFirst,
        onSkip: () => void finish(settingsWeekRoute()),
        busy: complete.isPending,
      }}
    >
      <div className="flex flex-col gap-(--space-5)">
        {data === undefined ? (
          <SkeletonBlock heightPx={160} />
        ) : data.workStartMin === null ? (
          <Text as="p" tone="secondary">
            {COPY.noWorkStart}
          </Text>
        ) : (
          <>
            <FitStrip
              wakeMin={data.wakeMin}
              workStartMin={data.workStartMin}
              orientMin={data.orientMin}
              prepMin={data.prepMin}
              availableMin={data.availableMin}
              workStartClock={data.workStartClock ?? ""}
            />
            <Text as="p">
              {data.fits ? COPY.fitsLine : COPY.fitSentence(data.routineMin, data.availableMin)}
            </Text>
            {data.fits ? null : (
              <LargeTargetRow
                label={COPY.overflowQuestion}
                layout="stacked"
                value={mode}
                onChange={(value) => setMode(value as OverflowMode)}
                options={[
                  { value: "daily_menu", label: COPY.modes.daily_menu, description: COPY.modes.daily_menuBody },
                  { value: "variants", label: COPY.modes.variants, description: COPY.modes.variantsBody },
                  { value: "auto_trim", label: COPY.modes.auto_trim, description: COPY.modes.auto_trimBody },
                ]}
              />
            )}
          </>
        )}
      </div>
    </StepFrame>
  );
}

/**
 * The room, drawn: wake → work start on the Schedule's axis. Forward from
 * wake: orient, then the routine's available span; backward from work: prep
 * — which is exactly `computeBudget`'s subtraction laid end to end.
 */
function FitStrip({
  wakeMin,
  workStartMin,
  orientMin,
  prepMin,
  availableMin,
  workStartClock,
}: {
  wakeMin: number;
  workStartMin: number;
  orientMin: number;
  prepMin: number;
  availableMin: number;
  workStartClock: string;
}) {
  const work = workStartMin < wakeMin ? workStartMin + 1440 : workStartMin;
  const startHour = Math.floor(wakeMin / 60) * 60;
  const endHour = Math.max(Math.ceil(work / 60) * 60, startHour + 60);
  const px = (minutes: number) => ((minutes - startHour) * PX_PER_HOUR) / 60;
  const height = (minutes: number) => Math.max(2, (minutes * PX_PER_HOUR) / 60);

  const orientStart = wakeMin;
  const routineStart = orientStart + orientMin;
  const prepStart = work - prepMin;

  return (
    <div aria-hidden="true">
      <ScheduleAxis startMin={startHour} endMin={endHour} pxPerHour={PX_PER_HOUR} timeZone="UTC">
        {orientMin > 0 ? (
          <BlockBand kind="orient" name={COPY.bandOrient(orientMin)} topPx={px(orientStart)} heightPx={height(orientMin)} />
        ) : null}
        {availableMin > 0 ? (
          <BlockBand
            kind="morning"
            name={COPY.bandRoutine(availableMin)}
            topPx={px(routineStart)}
            heightPx={height(availableMin)}
            pooled
          />
        ) : null}
        {prepMin > 0 ? (
          <BlockBand kind="prep" name={COPY.bandPrep(prepMin)} topPx={px(prepStart)} heightPx={height(prepMin)} />
        ) : null}
        <span
          style={{ top: `${px(work)}px`, insetInlineStart: `${SCHEDULE_GUTTER_PX}px` }}
          className="border-ink pointer-events-none absolute end-0 border-t"
        >
          <Text as="span" variant="caption" tone="secondary" className="bg-paper absolute -top-2.5 start-(--space-2) px-(--space-1)">
            {COPY.bandWork(workStartClock)}
          </Text>
        </span>
      </ScheduleAxis>
    </div>
  );
}
