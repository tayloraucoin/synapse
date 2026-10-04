import type { Meta, StoryObj } from "@storybook/react";

import { NextStrip } from "./next-strip";

/**
 * The header's one answer. A task is a button; *Everything is firing.* is
 * text; with no active column there is no strip at all.
 */
const meta: Meta<typeof NextStrip> = {
  title: "Composed/Display/NextStrip",
  component: NextStrip,
  args: {
    next: { kind: "task", groupName: "Northwind", title: "Review the pricing page copy" },
    onGo: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof NextStrip>;

export const ATask: Story = { name: "A task" };

export const ALongTitle: Story = {
  name: "A long title",
  args: {
    next: {
      kind: "task",
      groupName: "Harbor",
      title: "Reconcile the quarterly stockpile measurements against the vendor spreadsheet",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const NoGroup: Story = {
  name: "No group",
  args: { next: { kind: "task", groupName: null, title: "Read the API changelog" } },
};

export const EverythingFiring: Story = { name: "Everything firing", args: { next: { kind: "all_firing" } } };

/** Renders nothing. */
export const Absent: Story = { args: { next: null } };
