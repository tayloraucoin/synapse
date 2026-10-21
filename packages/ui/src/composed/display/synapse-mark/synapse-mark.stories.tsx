import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../../../primitives/typography/text";
import { SynapseMark } from "./synapse-mark";

/**
 * Mark A, the day split refined. Toggle the theme: the disc turns from ink
 * to paper and the rule from brand-500 to brand-400. Always on `background`.
 */
const meta: Meta<typeof SynapseMark> = {
  title: "Composed/Display/SynapseMark",
  component: SynapseMark,
  decorators: [
    (Story) => (
      <div className="bg-background p-(--space-8)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SynapseMark>;

export const Mark: Story = { args: { className: "size-24", label: "Synapse" } };

/** The small master, for a disc under 32px: no rule, a wider gap. */
export const Small: Story = {
  args: { className: "size-4", label: "Synapse", small: true },
};

/**
 * Beside the name, Public Sans at weight 500: the disc is 1.4 × the cap
 * height and sits D/2 from the "S". At body size that is a 16px disc, so the
 * small master.
 */
export const BesideTheName: Story = {
  render: () => (
    <span className="flex items-center gap-(--space-2)">
      <SynapseMark className="size-(--space-4)" small />
      <Text as="span" variant="body" weight={500}>
        Synapse
      </Text>
    </span>
  ),
};
