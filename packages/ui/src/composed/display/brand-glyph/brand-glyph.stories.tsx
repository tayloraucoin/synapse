import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "../../../primitives/typography/text";
import { BrandGlyph } from "./brand-glyph";

/**
 * The mark beside a link (UX v1.3 R53): the Spotify mark in ink at 20px — no
 * colour, no wordmark — or Lucide `Link`. Toggle the theme: it is the light
 * ink in dark.
 */
const meta: Meta<typeof BrandGlyph> = {
  title: "Composed/Display/BrandGlyph",
  component: BrandGlyph,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof BrandGlyph>;

export const Spotify: Story = { args: { kind: "spotify" } };

export const Link: Story = { args: { kind: "link" } };

/** Both, beside a title, as the callout will draw them. */
export const BesideATitle: Story = {
  render: () => (
    <div className="text-ink flex flex-col gap-(--space-3)">
      <span className="flex items-center gap-(--space-2)">
        <BrandGlyph kind="spotify" />
        <Text as="span" variant="row-title" weight={500}>
          Focus
        </Text>
      </span>
      <span className="flex items-center gap-(--space-2)">
        <BrandGlyph kind="link" />
        <Text as="span" variant="row-title" weight={500}>
          Morning notes
        </Text>
      </span>
    </div>
  ),
};
