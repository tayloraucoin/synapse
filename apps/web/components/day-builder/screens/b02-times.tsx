"use client";

import { Text, TimeField } from "@syn/ui";

import { spanLabel } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { between, type DayBuilderApi } from "../use-day-builder";

/**
 * B2 — up and lights out (UX v1.3 §4.4 B2, R64; DAY-9). The times of v1.2
 * §4.5 and §4.11, per plan; work's hours are B3's.
 *
 * THREE FIELDS, value + Change + Done — *Up at*, *Lights out*, *Phone away*
 * — each showing the value the day will have and WRITING ONLY WHEN TOUCHED:
 * an untouched field stays null on the plan. *Phone away* FOLLOWS the plan's
 * lights out, an hour before, until it is touched — the builder's `times`
 * and the service's `resolvePlanAnchors` compute it the same way. Nothing
 * here is an alarm. The profile's times are the first COMPLETE plan's
 * (`completeDayPlan`), not a write from here.
 */
export function ScreenTimes({ api, disabled }: { api: DayBuilderApi; disabled: boolean }) {
  const plan = api.plan;
  if (plan === null) return null;
  const { times } = api;
  const awake = between(times.wake, times.lightsOut);

  return (
    <div className="flex flex-col gap-(--space-4)">
      <TimeField
        label={COPY.b02.upAt}
        value={times.wake}
        onChange={(value) => void api.patch({ wakeTime: value })}
        disclosed
        doneLabel={COPY.done}
        disabled={disabled}
      />
      <TimeField
        label={COPY.b02.lightsOut}
        value={times.lightsOut}
        onChange={(value) => void api.patch({ lightsOutTime: value })}
        disclosed
        doneLabel={COPY.done}
        disabled={disabled}
      />
      <div className="flex flex-col gap-(--space-2)">
        <TimeField
          label={COPY.b02.phoneAway}
          value={times.devicesOff}
          onChange={(value) => void api.patch({ devicesOffTime: value })}
          disclosed
          doneLabel={COPY.done}
          disabled={disabled}
        />
        <Text as="p" variant="caption" tone="secondary">
          {COPY.b02.phoneAwayLine}
        </Text>
      </div>

      {awake === null ? null : (
        <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
          {COPY.b02.awake(spanLabel(awake))}
        </Text>
      )}
    </div>
  );
}
