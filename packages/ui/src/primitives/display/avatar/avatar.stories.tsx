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
 * The sizes the product uses: 28px on the header's and the rail's trigger,
 * 40px in the avatar menu's Who, 64px on the profile; 32px for older
 * callers. Round, the initial on paper with a hairline (USE-83).
 */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex items-end gap-(--space-6) p-(--space-8)">
      <Avatar name="Taylor Aucoin" size={28} />
      <Avatar name="Taylor Aucoin" size={32} />
      <Avatar name="Taylor Aucoin" size={40} />
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

/** "Taylor Aucoin" → "T", on paper. The fallback is the default state, not an error. */
export const InitialsFallback: Story = {
  args: { name: "Taylor Aucoin", size: 64 },
};
