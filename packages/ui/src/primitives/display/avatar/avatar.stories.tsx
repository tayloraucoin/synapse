import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Primitives/Display/Avatar",
  component: Avatar,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

/**
 * The two sizes the product uses, and no others: 32px in the header, 64px in
 * Settings → Account (official spec §9.8).
 */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex items-end gap-(--space-5) p-(--space-6)">
      <Avatar name="Taylor Aucoin" size={32} />
      <Avatar name="Taylor Aucoin" size={64} />
      <Avatar name="Taylor" size={64} />
      <Avatar
        name="Taylor Aucoin"
        size={64}
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%232F8F80'/%3E%3C/svg%3E"
      />
    </div>
  ),
};

/** "Taylor Aucoin" → "TA". The fallback is the default state, not an error. */
export const InitialsFallback: Story = {
  args: { name: "Taylor Aucoin", size: 64 },
};
