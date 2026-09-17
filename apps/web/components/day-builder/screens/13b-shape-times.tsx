"use client";

import * as React from "react";

import { LargeTargetRow, Text, TimeField } from "@syn/ui";

import { display, minutesOf, spanLabel } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import { between, type DayBuilderApi } from "../use-day-builder";

const NO_WORK = "__no_work__";

/**
 * 13b — the shape of it (UX v1.2 §4.13b).
 *
 * THE TYPES ARE THE ROWS, the first preselected by RUN-5's create when the
 * plan arrived with none; *No work on this day* writes a null template. The
 * four times show the value the day will have (the plan's own, or the
 * type's, or the profile's — TD-21) and WRITE ONLY WHEN TOUCHED: an
 * untouched field stays null on the plan and keeps following the profile.
 * *Until about* is hidden under *No work*.
 */
export function ScreenShapeTimes({ api, disabled }: { api: DayBuilderApi; disabled: boolean }) {
  const plan = api.plan;
  const { times, workTypes } = api;
  const noWork = plan?.work === null;

  // The first type is the answer until one is chosen — §13's default, written on arrival.
  const chosen = React.useRef(false);
  React.useEffect(() => {
    if (plan === null || chosen.current || disabled) return;
    if (plan.work !== null || plan.state === "complete") return;
    const first = workTypes[0];
    if (first === undefined) return;
    chosen.current = true;
    void api.patch({ workTemplateId: first.id });
  }, [plan, workTypes, api, disabled]);

  if (plan === null) return null;

  const before = between(times.wake, times.workStart);
  const after = between(times.workEnd, times.lightsOut);
  const awake = between(times.wake, times.lightsOut);

  return (
    <div className="flex flex-col gap-(--space-5)">
      {workTypes.length === 0 ? null : (
        <LargeTargetRow
          label={COPY.b.work}
          layout="stacked"
          disabled={disabled}
          value={noWork ? NO_WORK : (plan.work?.templateId ?? null)}
          onChange={(value) => void api.patch({ workTemplateId: value === NO_WORK ? null : value })}
          options={[
            ...workTypes.map((type) => {
              const start = type.workDayType?.startClock ?? api.profile?.workStartTime ?? null;
              const end = type.workDayType?.endClock ?? api.profile?.workEndTime ?? null;
              const startMin = minutesOf(start);
              const endMin = minutesOf(end);
              return {
                value: type.id,
                label: type.name,
                description:
                  startMin === null || endMin === null ? undefined : `${display(startMin)}–${display(endMin)}`,
                leading: type.workDayType?.icon ?? undefined,
              };
            }),
            { value: NO_WORK, label: COPY.b.noWorkOnThisDay },
          ]}
        />
      )}

      <div className="flex flex-col gap-(--space-4)">
        <TimeField
          label={COPY.b.upAt}
          value={times.wake}
          onChange={(value) => void api.patch({ wakeTime: value })}
          disclosed
          doneLabel={COPY.done}
          disabled={disabled}
        />
        {noWork ? null : (
          <>
            <TimeField
              label={COPY.b.workingBy}
              value={times.workStart}
              onChange={(value) => void api.patch({ workStartTime: value })}
              disclosed
              doneLabel={COPY.done}
              disabled={disabled}
            />
            <TimeField
              label={COPY.b.untilAbout}
              value={times.workEnd}
              onChange={(value) => void api.patch({ workEndTime: value })}
              disclosed
              doneLabel={COPY.done}
              disabled={disabled}
            />
          </>
        )}
        <TimeField
          label={COPY.b.lightsOut}
          value={times.lightsOut}
          onChange={(value) => void api.patch({ lightsOutTime: value })}
          disclosed
          doneLabel={COPY.done}
          disabled={disabled}
        />
      </div>

      <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
        {noWork
          ? awake === null
            ? null
            : COPY.b.spanNoWork(spanLabel(awake))
          : before === null || after === null
            ? null
            : COPY.b.spans(spanLabel(before), spanLabel(after))}
      </Text>
    </div>
  );
}
