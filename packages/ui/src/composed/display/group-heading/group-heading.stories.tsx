import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { GroupHeading } from "./group-heading";

const meta: Meta<typeof GroupHeading> = {
  title: "Composed/Display/GroupHeading",
  component: GroupHeading,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof GroupHeading>;

export const Default: Story = { args: { children: "Habits" } };

/** The count is a fact about the group, never a score about the day. */
export const WithCount: Story = { args: { children: "Habits", count: 12 } };

export const AsH3: Story = { args: { children: "Deep work", as: "h3" } };
