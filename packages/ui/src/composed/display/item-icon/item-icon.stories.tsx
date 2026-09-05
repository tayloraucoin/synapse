import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Caption } from "../../../primitives/typography/text";
import { CURATED_GLYPHS } from "./curated-glyphs";
import { ItemIcon } from "./item-icon";

const meta: Meta<typeof ItemIcon> = {
  title: "Composed/Display/ItemIcon",
  component: ItemIcon,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof ItemIcon>;

export const Emoji: Story = { args: { icon: { kind: "emoji", value: "🏃" } } };

export const Curated: Story = {
  args: { icon: { kind: "curated", value: "book-open", colorKey: "sky" } },
};

export const CuratedUntinted: Story = {
  args: { icon: { kind: "curated", value: "coffee", colorKey: null } },
};

/**
 * No icon still occupies the box. A row whose icon collapsed would put every
 * row beneath it at a different indent.
 */
export const None: Story = { args: { icon: null } };

/** A stored curated name that is no longer in the table falls back to the dot. */
export const UnknownGlyph: Story = {
  args: { icon: { kind: "curated", value: "retired-glyph", colorKey: null } },
};

export const Sizes: StoryObj = {
  render: () => (
    <div className="flex items-end gap-(--space-4) p-(--space-6)">
      {([20, 24, 48] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-(--space-1)">
          <ItemIcon
            icon={{ kind: "curated", value: "leaf", colorKey: "moss" }}
            size={size}
          />
          <Caption as="span">{size}</Caption>
        </div>
      ))}
    </div>
  ),
};

/** The whole curated table — what a person can pick is what a row can draw. */
export const AllGlyphs: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-(--space-2) p-(--space-6)">
      {CURATED_GLYPHS.map((glyph) => (
        <div
          key={glyph.name}
          title={glyph.label}
          className="flex w-16 flex-col items-center gap-(--space-1)"
        >
          <ItemIcon
            icon={{ kind: "curated", value: glyph.name, colorKey: null }}
          />
          <Caption as="span" className="truncate">
            {glyph.label}
          </Caption>
        </div>
      ))}
    </div>
  ),
};
