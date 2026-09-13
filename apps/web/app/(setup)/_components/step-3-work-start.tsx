"use client";

import * as React from "react";

import { LargeTargetRow, Text, TimeField } from "@syn/ui";
import type { AnchorDirection } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 3 — work start, and what gives (UX v1.1 §4.3).
 *
 * THE ONE GATED SCREEN. *9:00* and *17:30* are value + Change (W1); the
 * *what gives* radio has nothing preselected and the primary is disabled
 * until a row is chosen, "because this is the one screen whose answer
 * changes the arithmetic everywhere." The three rows are stated as neutrally
 * as each other; nothing here editorialises the choice.
 *
 * THE PLACEHOLDER IS THE ANSWER. 9:00 is shown because most people's answer
 * is near it; leaving it is choosing it, so *Continue* writes both times
 * even when neither was touched.
 */
export function Step3WorkStart({
  initialWorkStart,
  initialWorkEnd,
  initialDirection,
  embedded = false,
  onSaved,
}: {
  initialWorkStart: string | null;
  initialWorkEnd: string | null;
  initialDirection: AnchorDirection | null;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const save = trpc.user.updatePreferences.useMutation();
  const [workStart, setWorkStart] = React.useState(initialWorkStart ?? "09:00");
  const [workEnd, setWorkEnd] = React.useState(initialWorkEnd ?? "17:30");
  const [direction, setDirection] = React.useState<AnchorDirection | null>(initialDirection);

  return (
    <FactScreen
      step={3}
      heading={COPY.step3Heading}
      embedded={embedded}
      onSaved={onSaved}
      disabled={direction === null}
      save={async () => {
        if (direction === null) return;
        await save.mutateAsync({
          workStartTime: workStart,
          workEndTime: workEnd,
          anchorDirection: direction,
        });
      }}
    >
      <div className="flex flex-col gap-(--space-5)">
        <TimeField
          label={COPY.workingBy}
          value={workStart}
          onChange={setWorkStart}
          disclosed
          changeLabel={COPY.change}
          required
        />
        <TimeField
          label={COPY.untilAbout}
          value={workEnd}
          onChange={setWorkEnd}
          disclosed
          changeLabel={COPY.change}
          required
          className="text-(length:--fs-secondary)"
        />

        <div className="flex flex-col gap-(--space-3)">
          <Text as="h2" variant="body" weight={500}>
            {COPY.whatGives}
          </Text>
          <LargeTargetRow
            layout="stacked"
            label={COPY.whatGives}
            value={direction}
            onChange={(value) => setDirection(value as AnchorDirection)}
            options={[
              { value: "work_waits", label: COPY.gives.work_waits, description: COPY.gives.work_waitsBody },
              { value: "routine_cut", label: COPY.gives.routine_cut, description: COPY.gives.routine_cutBody },
              { value: "depends", label: COPY.gives.depends, description: COPY.gives.dependsBody },
            ]}
            className="[&>span:first-child]:sr-only"
          />
        </div>
      </div>
    </FactScreen>
  );
}
