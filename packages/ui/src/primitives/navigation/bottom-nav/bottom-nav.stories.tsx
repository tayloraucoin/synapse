import type { Meta, StoryObj } from "@storybook/react";

import { BottomNav, BottomNavItem, BottomNavList } from "./bottom-nav";

const meta: Meta<typeof BottomNav> = {
  title: "Primitives/Navigation/BottomNav",
  component: BottomNav,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

/** Word labels, never icons alone. The dot always carries hidden text. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="relative h-64">
      <BottomNav className="absolute">
        <BottomNavList>
          <BottomNavItem href="#" active>
            List
          </BottomNavItem>
          <BottomNavItem href="#">Schedule</BottomNavItem>
          <BottomNavItem href="#" dot dotLabel="items waiting">
            Review
          </BottomNavItem>
        </BottomNavList>
      </BottomNav>
    </div>
  ),
};

/** Under a sheet's scrim: visible, not tappable (cross-cutting §2.2). */
export const Dimmed: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="relative h-64">
      <BottomNav className="absolute">
        <BottomNavList>
          <BottomNavItem href="#" active dimmed>
            List
          </BottomNavItem>
          <BottomNavItem href="#" dimmed>
            Schedule
          </BottomNavItem>
          <BottomNavItem href="#" dimmed dot dotLabel="items waiting">
            Review
          </BottomNavItem>
        </BottomNavList>
      </BottomNav>
    </div>
  ),
};
