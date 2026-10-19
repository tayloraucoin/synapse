import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../../../primitives/typography/text";
import { HueSquare, type SquareHue } from "./hue-square";

/** The square beside a word. Never shown without its word. */
const meta: Meta<typeof HueSquare> = {
  title: "Composed/Display/HueSquare",
  component: HueSquare,
  args: { hue: "leaf" },
};

export default meta;

type Story = StoryObj<typeof HueSquare>;

export const Alone: Story = {};

const STEPS: { hue: SquareHue; word: string }[] = [
  { hue: "alert", word: "Urgent" },
  { hue: "leaf", word: "Primary" },
  { hue: "amber", word: "Secondary" },
  { hue: "slate", word: "Stretch" },
];

/** The tiers' step, each square beside its word (D-USE-38). */
export const BesideItsWord: Story = {
  render: () => (
    <div className="flex flex-col gap-(--space-2)">
      {STEPS.map(({ hue, word }) => (
        <span key={hue} className="inline-flex items-center gap-(--space-2)">
          <HueSquare hue={hue} />
          <Text as="span" variant="secondary" weight={600}>
            {word}
          </Text>
        </span>
      ))}
    </div>
  ),
};
