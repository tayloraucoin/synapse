import type { Meta, StoryObj } from "@storybook/react";

import { SleepBand } from "./sleep-band";

/**
 * The night beneath a day's axis (UX v1.3 §4.2, §4.4 B17): shortened, its
 * times in words, the neutral sleep wash in both themes.
 */
const meta: Meta<typeof SleepBand> = {
  title: "Composed/Display/SleepBand",
  component: SleepBand,
  decorators: [(Story) => <div className="max-w-[375px] p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof SleepBand>;

/** The primer's night — an hour of its 28px scale. */
export const Primer: Story = { args: { label: "Sleep · 22:30 to 7:00", heightPx: 28 } };

/** The review's night — at 96px an hour it is shortened to half an hour's height. */
export const Review: Story = { args: { label: "Sleep · 22:45 to 7:00", heightPx: 48 } };
