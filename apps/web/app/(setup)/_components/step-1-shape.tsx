"use client";

import * as React from "react";

import { EmojiSlot, LargeTargetRow } from "@syn/ui";
import { SCHEDULE_SHAPE_ICONS } from "@syn/constants";
import type { ScheduleShape } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 1 — the shape of your week (UX v1.2 §4.1; v1.1 §4.1).
 *
 * FOUR CARDS, ONE LIVE. The third is preselected, so *Continue* is one tap;
 * the other three "render at `text-text-disabled` including their emoji (at
 * 0.4 opacity, so the glyph does not shout what the text whispers), with the
 * caption *not yet* on the right, not tappable." Tapping a grey card does
 * nothing — no toast, "because a toast would be an apology." The routing an
 * archetype implies is invisible here.
 *
 * THE GLYPHS ARE DATA (v1.2 §4.1, R29): `SCHEDULE_SHAPE_ICONS` beside the
 * placeholder names, through `EmojiSlot` at the card size — each names the
 * kind of person on that card, and nothing else on the screen carries one.
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

  const glyph = (key: ScheduleShape) => <EmojiSlot icon={SCHEDULE_SHAPE_ICONS[key]} size="card" />;

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
            leading: glyph("consistent_shifts"),
            disabled: true,
            caption: COPY.notYet,
          },
          {
            value: "varying_shifts",
            label: COPY.shapes.varying_shifts,
            leading: glyph("varying_shifts"),
            disabled: true,
            caption: COPY.notYet,
          },
          {
            value: "own_structure_dynamic",
            label: COPY.shapes.own_structure_dynamic,
            leading: glyph("own_structure_dynamic"),
            description: COPY.shapes.own_structure_dynamicBody,
          },
          {
            value: "fluid",
            label: COPY.shapes.fluid,
            leading: glyph("fluid"),
            disabled: true,
            caption: COPY.notYet,
          },
        ]}
        className="[&>span:first-child]:sr-only"
      />
    </FactScreen>
  );
}
