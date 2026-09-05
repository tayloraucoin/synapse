import type { Meta, StoryObj } from "@storybook/react";

import { Kbd, KbdGroup } from "./kbd";

const meta: Meta<typeof Kbd> = {
  title: "Primitives/Display/Kbd",
  component: Kbd,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

/** Wide only — the shortcuts table on About → Keyboard (cross-cutting §3.1). */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex flex-col gap-(--space-3) p-(--space-6)">
      <KbdGroup>
        <Kbd>G</Kbd>
        <Kbd>L</Kbd>
      </KbdGroup>
      <Kbd>Esc</Kbd>
    </div>
  ),
};
