import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { BigNumber, FactLine, FormulaSentence } from "./big-number";

/**
 * The formula is shown, not just the answer. A percentage alone is a grade; a
 * percentage with its terms spelled out is a reckoning a person can argue
 * with — which is the product's whole position on scoring.
 */
const meta: Meta<typeof BigNumber> = {
  title: "Composed/Display/BigNumber",
  component: BigNumber,
  decorators: [
    (Story) => (
      <div className="flex max-w-xl flex-col gap-(--space-3) p-(--space-6)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const DayResult: StoryObj = {
  render: () => (
    <>
      <BigNumber value={71} size="day" />
      <FormulaSentence
        terms={[
          { count: 4, label: "done" },
          { count: 1, label: "planned it wrong", weight: "½" },
          { count: 1, label: "didn't do", weight: "0" },
          { count: 2, label: "something came up", weight: "not counted" },
        ]}
        credit={4.5}
        counted={6}
        percent={71}
      />
      <FactLine>Two items were carried to tomorrow.</FactLine>
    </>
  ),
};

/** Nothing counted: no number at all, and a sentence that says so. */
export const NothingCounted: StoryObj = {
  render: () => (
    <>
      <BigNumber value={null} size="day" />
      <FormulaSentence terms={[]} credit={0} counted={0} percent={null} />
    </>
  ),
};

export const WeekResult: StoryObj = {
  render: () => (
    <>
      <BigNumber value={64} size="week" />
      <FormulaSentence
        terms={[
          { count: 22, label: "done" },
          { count: 5, label: "planned it wrong", weight: "½" },
        ]}
        credit={24.5}
        counted={38}
        percent={64}
      />
    </>
  ),
};
