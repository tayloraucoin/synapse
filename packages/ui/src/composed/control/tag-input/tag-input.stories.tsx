import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TagInput } from "./tag-input";

/**
 * Type, then Enter or a comma: a chip with a 44px ×. Backspace on the empty
 * field takes the last chip back. With `max`, the muted count shows from one
 * under it and the field refuses the next add with one line.
 */
const meta: Meta<typeof TagInput> = {
  title: "Composed/Control/TagInput",
  component: TagInput,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

function Controlled(props: { initial: string[]; max?: number; error?: string; disabled?: boolean }) {
  const [value, setValue] = React.useState(props.initial);
  return (
    <TagInput
      label="Tags"
      placeholder="calm, morning"
      helperText="Words to find this passage by."
      value={value}
      onChange={setValue}
      max={props.max}
      maxLength={24}
      error={props.error}
      disabled={props.disabled}
    />
  );
}

export const Empty: StoryObj = { render: () => <Controlled initial={[]} /> };

export const WithTags: StoryObj = { render: () => <Controlled initial={["calm", "morning"]} /> };

/** Four of five: the count shows; add one more and the field says it is full. */
export const NearMax: StoryObj = {
  render: () => <Controlled initial={["calm", "morning", "stoic", "short"]} max={5} />,
};

export const AtMax: StoryObj = {
  render: () => <Controlled initial={["calm", "morning", "stoic", "short", "evening"]} max={5} />,
};

export const Error: StoryObj = {
  render: () => <Controlled initial={["calm"]} error="Tags are words, not sentences." />,
};

export const Disabled: StoryObj = { render: () => <Controlled initial={["calm"]} disabled /> };
