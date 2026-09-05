import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { SettingsRow } from "./settings-row";

const meta: Meta<typeof SettingsRow> = {
  title: "Composed/Display/SettingsRow",
  component: SettingsRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ul className="divide-hairline max-w-2xl divide-y">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SettingsRow>;

export const Default: Story = {
  args: {
    title: "Notifications",
    description: "Reminders, and when the day closes",
    href: "#",
  },
};

/** ST-00 as it actually reads — one shape, so the index cannot drift. */
export const Index: StoryObj = {
  render: () => (
    <>
      <SettingsRow title="Account" description="Name, email, password" href="#" />
      <SettingsRow title="Habits" description="Your library" href="#" />
      <SettingsRow title="Templates" description="Days you repeat" href="#" />
      <SettingsRow title="Your data" description="Export or delete" href="#" />
    </>
  ),
};
