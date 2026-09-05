import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { DayHeader } from "./day-header";

const meta: Meta<typeof DayHeader> = {
  title: "Composed/Display/DayHeader",
  component: DayHeader,
  parameters: { layout: "fullscreen" },
  args: { dateLabel: "Friday 4 Sept", mode: "live", onOpen: () => {} },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof DayHeader>;

export const NoTemplate: Story = { args: { templateName: null } };

export const WithTemplate: Story = {
  args: { templateName: "Weekday morning", wokeAtLabel: "7:02 AM" },
};

export const Shifted: Story = {
  args: { templateName: "Weekday morning", shiftedMin: 60 },
};

/** While the day's zone differs from the device's, the header says which. */
export const OtherZone: Story = {
  args: { templateName: "Weekday morning", zoneLabel: "times in Vancouver" },
};

export const PlanMode: Story = {
  args: {
    templateName: "Weekday morning",
    mode: "plan",
    notUntilWeekday: "Monday",
  },
};

/** Nothing to open — a heading, not a dead button. */
export const NotTappable: Story = {
  args: { templateName: "Weekday morning", onOpen: undefined },
};

/**
 * `as="p"` for a surface that already has its `h1` — the landing page shows a
 * planned day as a figure (SYS-6). The type scale does not change; only the
 * element does, because the level is document structure.
 */
export const AsParagraph: Story = {
  args: {
    dateLabel: "Tuesday",
    templateName: "Weekday",
    mode: "plan",
    as: "p",
    onOpen: undefined,
  },
};
