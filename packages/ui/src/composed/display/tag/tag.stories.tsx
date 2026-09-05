import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Tag } from "./tag";

const meta: Meta<typeof Tag> = {
  title: "Composed/Display/Tag",
  component: Tag,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Muted: Story = { args: { children: "archived" } };

/** `accent` is for *overridden* and nothing else. */
export const Accent: Story = { args: { children: "overridden", tone: "accent" } };

export const Vocabulary: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-3) p-(--space-6)">
      {["wake-up", "archived", "default", "planned"].map((word) => (
        <Tag key={word}>{word}</Tag>
      ))}
      <Tag tone="accent">overridden</Tag>
    </div>
  ),
};
