import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { DayOutcomeRow, ShiftRow, WeekRow } from "./day-outcome-row";

const meta: Meta<typeof DayOutcomeRow> = {
  title: "Composed/Display/DayOutcomeRow",
  component: DayOutcomeRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ul className="max-w-2xl p-(--space-6)">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DayOutcomeRow>;

export const Long: Story = {
  args: {
    weekday: "Tuesday",
    timeLabel: "7:00",
    outcome: "Done",
    weightPhrase: "counts",
    minutes: 38,
    form: "long",
    onOpen: () => {},
  },
};

export const Short: Story = {
  args: { weekday: "Wednesday", outcome: "Missed — slept in", form: "short" },
};

/** A delta and a reason. Nothing here calls it a bad day. */
export const Shift: StoryObj = {
  render: () => (
    <ShiftRow
      weekday="Thursday"
      deltaMin={60}
      atLabel="7:40"
      reason="slept in"
      cutCount={2}
      onOpen={() => {}}
    />
  ),
};

export const Week: StoryObj = {
  render: () => (
    <WeekRow
      rangeLabel="1–7 Sept"
      status="24.5 of 38 counted"
      onOpenWeek={() => {}}
    >
      <DayOutcomeRow weekday="Monday" outcome="Done" form="short" />
      <DayOutcomeRow weekday="Tuesday" outcome="Missed — ran long" form="short" />
      <DayOutcomeRow weekday="Wednesday" outcome="Not assigned" form="short" />
    </WeekRow>
  ),
};
