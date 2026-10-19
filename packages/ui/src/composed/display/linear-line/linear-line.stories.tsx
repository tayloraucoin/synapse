import type { Meta, StoryObj } from "@storybook/react";
import { LinearLine } from "./linear-line";

/** A linked item's Linear line, as the Item sheet draws it. */
const meta: Meta<typeof LinearLine> = {
  title: "Composed/Display/LinearLine",
  component: LinearLine,
  args: {
    status: { type: "started", label: "In progress", progress: 0.5 },
    identifier: "KES-42",
    project: { emoji: "🏥", name: "Patient portal" },
    href: "https://linear.app/",
    linkLabel: "Linear",
  },
};

export default meta;

type Story = StoryObj<typeof LinearLine>;

export const ReadOnly: Story = {};

export const WithStatusPicker: Story = {
  args: {
    onStatusPress: () => undefined,
    statusActionLabel: "Status: In progress, change",
  },
};

export const Done: Story = {
  args: { status: { type: "completed", label: "Done" } },
};

export const NoProject: Story = { args: { project: null } };
