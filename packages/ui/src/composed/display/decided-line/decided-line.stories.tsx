import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { DecidedLine } from "./decided-line";

const meta: Meta<typeof DecidedLine> = {
  title: "Composed/Display/DecidedLine",
  component: DecidedLine,
  args: { onChange: () => {} },
  decorators: [(Story) => <div className="max-w-xl p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof DecidedLine>;

export const Carried: Story = {
  args: { text: "Carry forward → tomorrow", weightPhrase: "" },
};

export const NotCounted: Story = {
  args: {
    text: "Missed — something came up: car wouldn't start",
    weightPhrase: "not counted",
  },
};

export const CountsHalf: Story = {
  args: { text: "Missed — planned it wrong: slept in", weightPhrase: "counts half" },
};

/** A fact, no advice (DR-02). */
export const WithCarriedNote: Story = {
  args: {
    text: "Carry forward → tomorrow",
    weightPhrase: "",
    note: "Carried 3 times since 12 Aug.",
  },
};
