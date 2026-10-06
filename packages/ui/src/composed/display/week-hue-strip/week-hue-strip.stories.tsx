import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "../../../primitives/typography/text";
import { WeekHueStrip, type WeekHueStripProps } from "./week-hue-strip";

/**
 * A plan's day as a strip of its blocks' hues (UX v1.3 §4.5, §13 #36):
 * 12px, proportional, `aria-hidden` — the summary line is the text.
 */
const meta: Meta<typeof WeekHueStrip> = {
  title: "Composed/Display/WeekHueStrip",
  component: WeekHueStrip,
  decorators: [(Story) => <div className="max-w-[375px] p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof WeekHueStrip>;

/** The example day — 1440 minutes; work's 570 is ~40% of the width. */
const WORK_DAY: WeekHueStripProps["segments"] = [
  { kind: "orient", minutes: 5 },
  { kind: "morning", minutes: 55 },
  { kind: "training", minutes: 60 },
  { kind: "prep", minutes: 30 },
  { kind: "work", minutes: 570 },
  { kind: "transition", minutes: 30 },
  { kind: "activity", minutes: 90 },
  { kind: "wind_down", minutes: 90 },
  { kind: "sleep", minutes: 510 },
];

export const AWorkDay: Story = { args: { segments: WORK_DAY } };

export const ANoWorkDay: Story = {
  args: {
    segments: [
      { kind: "orient", minutes: 10 },
      { kind: "morning", minutes: 90 },
      { kind: "training", minutes: 90 },
      { kind: "activity", minutes: 600 },
      { kind: "wind_down", minutes: 90 },
      { kind: "sleep", minutes: 560 },
    ],
  },
};

/** An unstructured day has no strip — the component draws nothing. */
export const UnstructuredNoStrip: Story = { args: { segments: [] } };

/** As screen 5's row will set it: the name, the strip, the summary line. */
export const InARow: Story = {
  render: () => (
    <div className="flex flex-col gap-(--space-1)">
      <Text as="span" variant="row-title" weight={500}>
        Day A · Mon Tue Thu
      </Text>
      <WeekHueStrip segments={WORK_DAY} />
      <Text as="span" variant="caption" tone="secondary">
        Up 7:00 · work 9:30–17:00 · lights out 22:30
      </Text>
    </div>
  ),
};
