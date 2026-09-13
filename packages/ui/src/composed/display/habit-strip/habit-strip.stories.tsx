import type { StripState } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Caption } from "../../../primitives/typography/text";
import { DAY_LABELS, HABIT } from "../../__fixtures__/view-models";
import { HabitStrip, StripSquare } from "./habit-strip";

const WEEK = [
  "done",
  "done-moved",
  "half",
  "didnt-do",
  "not-counted",
  "not-assigned",
  "pending",
] as const satisfies readonly StripState[];

const meta: Meta<typeof HabitStrip> = {
  title: "Composed/Display/HabitStrip",
  component: HabitStrip,
  parameters: { layout: "fullscreen" },
  args: {
    habit: HABIT,
    days: WEEK,
    dayLabels: DAY_LABELS,
    credit: 4.5,
    counted: 6,
    layout: "inline",
    onOpen: () => {},
  },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof HabitStrip>;

export const Inline: Story = {};

export const Stacked: Story = { args: { layout: "stacked" } };

/**
 * Seven states told apart by SHAPE, never by hue (official spec §9.3). Read
 * this sheet in greyscale — it must still be legible, because for some people
 * it always is.
 */
export const SquareVocabulary: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-4) p-(--space-6)">
      {WEEK.map((state) => (
        <div key={state} className="flex flex-col items-center gap-(--space-1)">
          <StripSquare state={state} size={24} label={state} />
          <Caption as="span">{state}</Caption>
        </div>
      ))}
    </div>
  ),
};

/** UX v1.1 §7.3 (DYN-7): a wind-down item left unticked — blank, labelled *not confirmed*. */
export const WithNotConfirmed: Story = {
  args: {
    days: ["done", "not-confirmed", "done", "not-confirmed", "done", "not-assigned", "pending"],
    credit: 3,
    counted: 4,
  },
};

/** The eighth square beside the seven. */
export const NotConfirmedSquare: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-4) p-(--space-6)">
      {([...WEEK, "not-confirmed"] as const).map((state) => (
        <div key={state} className="flex flex-col items-center gap-(--space-1)">
          <StripSquare state={state} size={24} label={state} />
          <Caption as="span">{state}</Caption>
        </div>
      ))}
    </div>
  ),
};
