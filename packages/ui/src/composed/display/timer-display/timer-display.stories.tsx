import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TimerDisplay } from "./timer-display";

/**
 * Tabular figures are load-bearing: with proportional digits the whole number
 * shuffles sideways every second, which is exactly the motion official spec
 * §9.6 rules out.
 */
const meta: Meta<typeof TimerDisplay> = {
  title: "Composed/Display/TimerDisplay",
  component: TimerDisplay,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof TimerDisplay>;

export const Idle: Story = { args: { elapsedSec: 0, status: "idle" } };

export const UnderAMinute: Story = { args: { elapsedSec: 41, status: "running" } };

export const UnderAnHour: Story = { args: { elapsedSec: 761, status: "running" } };

export const PastAnHour: Story = { args: { elapsedSec: 3661, status: "running" } };

export const Paused: Story = { args: { elapsedSec: 761, status: "paused" } };
