import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { DayCompleteAction } from "./day-complete-action";

/**
 * A ghost, not a filled button: closing the day is the person's own decision
 * at their own pace, and a primary button at the bottom of every list would
 * read as something the app wants.
 *
 * After the day closes the button is replaced, not disabled — a dead control
 * at the end of a finished day is a dead end.
 */
const meta: Meta<typeof DayCompleteAction> = {
  title: "Composed/Control/DayCompleteAction",
  component: DayCompleteAction,
  parameters: { layout: "fullscreen" },
  args: { onComplete: () => {}, reviewHref: "#" },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof DayCompleteAction>;

export const Open: Story = { args: { closedAtLabel: null } };

export const Closed: Story = { args: { closedAtLabel: "Closed 10:14 PM" } };

export const Closing: Story = { args: { closedAtLabel: null, busy: true } };
