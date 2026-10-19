import type { Meta, StoryObj } from "@storybook/react";
import { ProgressRing } from "./progress-ring";

/**
 * A Running row's ring (USE-24): the ink arc is the share of the plan
 * elapsed, on a hairline circle. Past the plan it stays full; the row's
 * words say how far over.
 */
const meta: Meta<typeof ProgressRing> = {
  title: "Composed/Display/ProgressRing",
  component: ProgressRing,
  decorators: [
    (Story) => (
      <div className="p-(--space-8)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProgressRing>;

export const Empty: Story = { args: { value: 0 } };

export const AQuarter: Story = { args: { value: 0.25 } };

export const ThreeQuarters: Story = { args: { value: 0.75 } };

export const Full: Story = { args: { value: 1 } };

/** The four side by side, for the capture. */
export const All: Story = {
  render: () => (
    <div className="flex items-center gap-(--space-6)">
      {[0, 0.25, 0.75, 1].map((value) => (
        <ProgressRing key={value} value={value} />
      ))}
    </div>
  ),
};
