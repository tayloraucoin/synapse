"use client";

import * as React from "react";

import { LargeTargetRow } from "@syn/ui";
import type { ScheduleShape } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 1 — the shape of your week (UX v1.1 §4.1).
 *
 * FOUR CARDS, ONE LIVE. The third is preselected, so *Continue* is one tap;
 * the other three "render at `text-text-disabled` with a caption *not yet*
 * on the right, not tappable, no explanation." Tapping a grey card does
 * nothing — no toast, "because a toast would be an apology." The routing an
 * archetype implies is invisible here.
 *
 * The first screen is not skippable (§4: "everything after screen 1").
 */
export function Step1Shape({
  initialShape,
  embedded = false,
  onSaved,
}: {
  initialShape: ScheduleShape | null;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const save = trpc.user.updatePreferences.useMutation();
  const [shape, setShape] = React.useState<ScheduleShape>(
    initialShape ?? "own_structure_dynamic",
  );

  return (
    <FactScreen
      step={1}
      heading={COPY.step1Heading}
      skippable={false}
      embedded={embedded}
      onSaved={onSaved}
      save={async () => {
        await save.mutateAsync({ scheduleShape: shape });
      }}
    >
      <LargeTargetRow
        layout="stacked"
        label={COPY.step1Heading}
        value={shape}
        onChange={(value) => setShape(value as ScheduleShape)}
        options={[
          {
            value: "consistent_shifts",
            label: COPY.shapes.consistent_shifts,
            disabled: true,
            caption: COPY.notYet,
          },
          {
            value: "varying_shifts",
            label: COPY.shapes.varying_shifts,
            disabled: true,
            caption: COPY.notYet,
          },
          {
            value: "own_structure_dynamic",
            label: COPY.shapes.own_structure_dynamic,
            description: COPY.shapes.own_structure_dynamicBody,
          },
          { value: "fluid", label: COPY.shapes.fluid, disabled: true, caption: COPY.notYet },
        ]}
        className="[&>span:first-child]:sr-only"
      />
    </FactScreen>
  );
}
