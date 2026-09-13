"use client";

import * as React from "react";

import { ListRow, SegmentedControl, Text } from "@syn/ui";
import type { WorkDayMode, WorkDays } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 2 — work days (UX v1.1 §4.2).
 *
 * Seven rows, Monday first, each with the three-way control. Mon–Fri
 * *Always*, Sat *Sometimes*, Sun *Never* — "Taylor's own week as the
 * default, because it is also the common one" (§13 #7). A *sometimes* day is
 * the one the morning asks about (§3.9); the muted line says so.
 *
 * W5: the segments never wrap — `SegmentedControl` stacks under the day when
 * three would.
 */

const DEFAULT_WORK_DAYS: WorkDays = {
  "0": "always",
  "1": "always",
  "2": "always",
  "3": "always",
  "4": "always",
  "5": "sometimes",
  "6": "never",
};

const KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;

export function Step2WorkDays({
  initialWorkDays,
  embedded = false,
  onSaved,
}: {
  initialWorkDays: WorkDays | null;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const save = trpc.user.updatePreferences.useMutation();
  const [workDays, setWorkDays] = React.useState<WorkDays>(initialWorkDays ?? DEFAULT_WORK_DAYS);

  return (
    <FactScreen
      step={2}
      heading={COPY.step2Heading}
      body={COPY.step2Body}
      embedded={embedded}
      onSaved={onSaved}
      save={async () => {
        await save.mutateAsync({ workDays });
      }}
    >
      <ul className="divide-hairline flex flex-col divide-y">
        {KEYS.map((key, index) => (
          <ListRow
            key={key}
            as="li"
            title={COPY.weekdays[index]}
            trailing={
              <SegmentedControl
                label={COPY.weekdays[index]}
                value={workDays[key]}
                stacked="auto"
                onChange={(value) =>
                  setWorkDays((current) => ({ ...current, [key]: value as WorkDayMode }))
                }
                options={[
                  { value: "always", label: COPY.always },
                  { value: "sometimes", label: COPY.sometimes },
                  { value: "never", label: COPY.never },
                ]}
                classes={{ root: "w-56 max-w-full", label: "sr-only" }}
              />
            }
          />
        ))}
      </ul>
      <Text as="p" variant="secondary" tone="secondary">
        {COPY.sometimesMeans}
      </Text>
    </FactScreen>
  );
}
