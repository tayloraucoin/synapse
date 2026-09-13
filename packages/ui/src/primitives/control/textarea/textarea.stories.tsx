import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "Primitives/Control/Textarea",
  component: Textarea,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex max-w-sm flex-col gap-(--space-5) p-(--space-6)">
      <Textarea label="Note" helperText="Optional." placeholder="" />
      <Textarea label="Note" autoGrow defaultValue="Grows with what is typed." />
      <Textarea label="What was it?" error="Say what it was, in a few words." />
      <Textarea label="Note" disabled defaultValue="Read only." />
    </div>
  ),
};

/**
 * The serif variant — UX v1.1 §5.2, §7.2: one row to start, Newsreader at
 * body size, a hairline underneath; grows with the words, then scrolls.
 */
export const Serif: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="bg-paper flex max-w-(--content-text) flex-col gap-(--space-6) p-(--space-6)">
      <Textarea variant="serif" label="Grateful for, this morning" placeholder="" />
      <Textarea
        variant="serif"
        label="Tomorrow, as I see it"
        defaultValue={
          "Up at seven, the walk before the light goes.\nThe stand-up is short; the afternoon is the essay.\nPhone away at quarter past ten."
        }
      />
    </div>
  ),
};
