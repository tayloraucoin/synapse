import type { Meta, StoryObj } from "@storybook/react";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Primitives/Navigation/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

/** `collapsible="none"` is the only mode Synapse uses — the rail is always there. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="none" className="h-64">
        <SidebarContent>
          <SidebarMenu>
            {["List", "Schedule", "Review", "Settings"].map((label, index) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton isActive={index === 0}>
                  {label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};
