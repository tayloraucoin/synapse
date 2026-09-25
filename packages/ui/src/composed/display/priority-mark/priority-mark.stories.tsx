import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { Stepper17 } from "../../control/stepper-17";
import { EmojiSlot } from "../emoji-slot";
import { PriorityMark, type PriorityMarkValue } from "./priority-mark";

/**
 * The matters number as the chosen `Stepper17` cell in miniature (UX v1.3
 * R59): 24px, ink fill, the number at caption size. Never interactive; its
 * name is *matters n*.
 */
const meta: Meta<typeof PriorityMark> = {
  title: "Composed/Display/PriorityMark",
  component: PriorityMark,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
  args: { value: 5 },
};

export default meta;

type Story = StoryObj<typeof PriorityMark>;

export const Default: Story = {};

const SEVEN: PriorityMarkValue[] = [1, 2, 3, 4, 5, 6, 7];

/** 1 through 7 in a row — each legible at caption size. */
export const OneThroughSeven: Story = {
  render: () => (
    <div className="flex items-center gap-(--space-2)">
      {SEVEN.map((value) => (
        <PriorityMark key={value} value={value} />
      ))}
    </div>
  ),
};

/** Beside the glyph and the title on a collapsed card's first line, at 375px. */
export const BesideAGlyphAndATitle: Story = {
  render: () => (
    <div className="bg-surface border-hairline flex max-w-[375px] items-center gap-(--space-2) rounded-md border p-(--space-4)">
      <EmojiSlot icon={{ kind: "emoji", value: "🧘" }} size="card" />
      <PriorityMark value={5} />
      <Text as="span" variant="row-title" weight={500} truncate className="min-w-0 flex-1">
        Stretch
      </Text>
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    </div>
  ),
};

/** The mark beside the control it miniaturises: the same fill and the same radius. */
export const BesideTheStepper: Story = {
  render: () => (
    <div className="flex flex-col gap-(--space-4)">
      <Stepper17 label="How much does it matter?" layout="row" value={5} captions={false} />
      <div className="flex items-center gap-(--space-2)">
        <PriorityMark value={5} />
        <Text as="span" variant="caption" tone="secondary">
          the mark
        </Text>
      </div>
    </div>
  ),
};
