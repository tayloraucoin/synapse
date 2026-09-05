import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Text } from "../../../primitives/typography/text";
import { EmojiPicker } from "./emoji-picker";

/**
 * The dataset is served from our own origin — `scripts/copy-emoji-data.mjs`
 * stages it into `apps/web/public/emoji`, which Storybook serves via
 * `staticDirs`. If the picker is empty here, run `yarn emoji-data`.
 *
 * Native system emoji, not a vendor's art style: the mark a person picks is
 * the mark their own keyboard produces.
 */
const meta: Meta<typeof EmojiPicker> = {
  title: "Composed/Control/EmojiPicker",
  component: EmojiPicker,
  decorators: [(Story) => <div className="max-w-sm p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [picked, setPicked] = React.useState<string | null>(null);
    return (
      <div className="flex flex-col gap-(--space-3)">
        <EmojiPicker onSelect={setPicked} />
        <Text as="p" variant="secondary" tone="secondary">
          {picked === null ? "Nothing picked yet." : `Picked ${picked}`}
        </Text>
      </div>
    );
  },
};
