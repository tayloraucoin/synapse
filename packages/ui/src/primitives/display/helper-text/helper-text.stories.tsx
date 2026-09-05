import type { Meta, StoryObj } from "@storybook/react";

import { HelperText } from "./helper-text";

const meta: Meta<typeof HelperText> = {
  title: "Primitives/Display/HelperText",
  component: HelperText,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof HelperText>;

/** The error line is ink with role="alert" — never red (§9.3). */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex flex-col gap-(--space-3) p-(--space-6)">
      <HelperText>A rough range is fine.</HelperText>
      <HelperText error>Give it a name.</HelperText>
    </div>
  ),
};
