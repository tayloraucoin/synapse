import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Caption, Text } from "../../../primitives/typography/text";
import { EmojiSlot } from "./emoji-slot";

/**
 * One rule for every emoji slot (UX v1.2 §10.2): a 44px square, `font-emoji`,
 * `aria-hidden`. `row` is 1.25rem; `card` is the header's 1.5rem. A curated
 * glyph or no icon still takes the same square, so a list never re-indents.
 */
const meta: Meta<typeof EmojiSlot> = {
  title: "Composed/Display/EmojiSlot",
  component: EmojiSlot,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof EmojiSlot>;

export const Row: Story = { args: { icon: { kind: "emoji", value: "🏃" }, size: "row" } };

export const Card: Story = { args: { icon: { kind: "emoji", value: "☕" }, size: "card" } };

/** The same square when the icon is a glyph or nothing at all. */
export const NotAnEmoji: StoryObj = {
  render: () => (
    <div className="flex items-end gap-(--space-4)">
      <div className="flex flex-col items-center gap-(--space-1)">
        <EmojiSlot icon={{ kind: "curated", value: "book-open", colorKey: "sky" }} />
        <Caption as="span">curated</Caption>
      </div>
      <div className="flex flex-col items-center gap-(--space-1)">
        <EmojiSlot icon={null} />
        <Caption as="span">none</Caption>
      </div>
    </div>
  ),
};

/** Centred on the row's control: the slot beside a 56px row title. */
export const OnARow: StoryObj = {
  render: () => (
    <div className="border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-y px-(--space-2)">
      <EmojiSlot icon={{ kind: "emoji", value: "🧘" }} />
      <Text as="span" variant="row-title" weight={500}>
        Stretch
      </Text>
    </div>
  ),
};
