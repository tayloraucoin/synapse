import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../../../primitives/typography/text";
import { SynapseMark } from "./synapse-mark";

/**
 * The kit's placeholder mark. Toggle the theme: the disc turns from ink to
 * paper and the rule from brand-500 to brand-400. Always on `background`.
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

/** Beside the name, as the rail draws it: Public Sans at weight 500. */
export const BesideTheName: Story = {
  render: () => (
    <span className="flex items-center gap-(--space-2)">
      <SynapseMark />
      <Text as="span" variant="body" weight={500}>
        Synapse
      </Text>
    </span>
  ),
};
