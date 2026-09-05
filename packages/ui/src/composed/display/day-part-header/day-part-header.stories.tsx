import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { DayPartHeader } from "./day-part-header";

const meta: Meta<typeof DayPartHeader> = {
  title: "Composed/Display/DayPartHeader",
  component: DayPartHeader,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof DayPartHeader>;

export const Morning: Story = { args: { part: "morning" } };

export const WithSpan: Story = {
  args: {
    part: "afternoon",
    span: { startLabel: "12:00", endLabel: "5:00" },
  },
};

export const AllParts: StoryObj = {
  render: () => (
    <>
      <DayPartHeader part="morning" span={{ startLabel: "6:00", endLabel: "12:00" }} />
      <DayPartHeader part="afternoon" span={{ startLabel: "12:00", endLabel: "5:00" }} />
      <DayPartHeader part="evening" span={{ startLabel: "5:00", endLabel: "10:00" }} />
      <DayPartHeader part="anytime" />
    </>
  ),
};
