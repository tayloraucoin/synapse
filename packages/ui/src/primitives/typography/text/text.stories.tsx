import type { Meta, StoryObj } from "@storybook/react";

import { Caption, Heading, Meta as MetaText, Text } from "./text";
import { TEXT_TONES, TEXT_VARIANTS } from "./text.variants";

/**
 * The whole scale, in one place. Official spec §9.4 fixes the sizes; the v2
 * handoff §5.1 fixes the axes.
 *
 * Consumer rule, restated because it cannot be enforced here: one `h1` per
 * screen. `Heading` defaults to `as="h1"`; pass `as="h2"` for every heading
 * after the first. The size does not change with the level.
 */
const meta: Meta<typeof Text> = {
  title: "Primitives/Typography/Text",
  component: Text,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Overview: Story = {
  render: () => (
    <div className="flex flex-col gap-(--space-5) p-(--space-6)">
      {TEXT_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-(--space-1)">
          <Caption as="span" tone="muted">
            {variant}
          </Caption>
          <Text as="p" variant={variant}>
            Immediate wake up · 7:20 — 1,234 minutes across 7 days
          </Text>
        </div>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-(--space-3) p-(--space-6)">
      {TEXT_TONES.map((tone) => (
        <div key={tone} className="flex items-baseline gap-(--space-3)">
          <Caption as="span" tone="muted" className="w-24 shrink-0">
            {tone}
          </Caption>
          <Text as="p" variant="row-title" tone={tone}>
            Deep work · 1:00–4:00
          </Text>
        </div>
      ))}
    </div>
  ),
};

export const TabularFigures: Story = {
  render: () => (
    <div className="flex flex-col gap-(--space-4) p-(--space-6)">
      <div className="flex flex-col">
        <Caption as="span" tone="muted">
          tabular (default) — times align down the column
        </Caption>
        {["7:20", "11:05", "1:00", "16:45"].map((time) => (
          <Text key={time} as="span" variant="body">
            {time}
          </Text>
        ))}
      </div>
      <div className="flex flex-col">
        <Caption as="span" tone="muted">
          tabular={"{false}"} — prose, where proportional reads better
        </Caption>
        <Text as="p" variant="body" tabular={false} className="max-w-(--measure)">
          9 done, 1 planned wrong (½), 1 didn&apos;t do (0), 1 excused (not
          counted) → 9.5 / 11 = 86%.
        </Text>
      </div>
    </div>
  ),
};

export const Presets: Story = {
  render: () => (
    <div className="flex flex-col gap-(--space-4) p-(--space-6)">
      <Heading>Friday 4 September</Heading>
      <MetaText as="p">Morning A · Woke 7:04</MetaText>
      <Text as="p" variant="row-title">
        Immediate wake up
      </Text>
      <Caption as="p">counts as done for the record</Caption>
      <Text as="p" variant="review-headline" balance>
        86%
      </Text>
      <Text
        as="p"
        variant="review-sentence"
        tone="body"
        tabular={false}
        className="max-w-(--measure)"
      >
        9 done, 1 planned wrong (½), 1 didn&apos;t do (0), 1 excused (not
        counted) → 9.5 / 11 = 86%.
      </Text>
    </div>
  ),
};
