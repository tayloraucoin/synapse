import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IconTile } from "./icon-tile";

/**
 * An icon on its kind-colour chip (USE-22): the Meal topics sheet's rows,
 * and the same icon bare at a topic chip's leading edge.
 */
const meta: Meta<typeof IconTile> = {
  title: "Composed/Display/IconTile",
  component: IconTile,
  decorators: [
    (Story) => (
      <div className="p-(--space-8)">
        <Story />
      </div>
    ),
  ],
  args: { icon: { kind: "lucide", value: "bot", color: "sky" } },
};

export default meta;

type Story = StoryObj<typeof IconTile>;

export const KindColour: Story = {};

/** The four meal topics on the boards, tiles then bare. */
export const MealTopics: Story = {
  render: () => {
    const icons = [
      { kind: "lucide", value: "bot", color: "sky" },
      { kind: "lucide", value: "dumbbell", color: "rose" },
      { kind: "lucide", value: "landmark", color: "amber" },
      { kind: "lucide", value: "cooking-pot", color: "leaf" },
    ] as const;
    return (
      <div className="flex flex-col gap-(--space-4)">
        <div className="flex gap-(--space-3)">
          {icons.map((icon) => (
            <IconTile key={icon.value} icon={icon} />
          ))}
        </div>
        <div className="flex gap-(--space-3)">
          {icons.map((icon) => (
            <IconTile key={icon.value} icon={icon} variant="bare" />
          ))}
        </div>
      </div>
    );
  },
};

export const CustomHex: Story = {
  args: { icon: { kind: "lucide", value: "book-open", color: "#6a4c93" } },
};

export const Emoji: Story = { args: { icon: { kind: "emoji", value: "🍳" } } };

/** No icon yet: the neutral tile with ItemIcon's dot, so rows keep their indent. */
export const NoIcon: Story = { args: { icon: null } };
