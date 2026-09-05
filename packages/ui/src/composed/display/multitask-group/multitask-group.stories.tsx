import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { STORY_TIME_ZONE, itemInState } from "../../__fixtures__/view-models";
import { ItemRow } from "../item-row";
import { MultitaskGroup } from "./multitask-group";

/**
 * The word *multitask* is above the bracket for a reason: an indent alone
 * means "child of" in every other list a person has used.
 */
const meta: Meta<typeof MultitaskGroup> = {
  title: "Composed/Display/MultitaskGroup",
  component: MultitaskGroup,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ul className="max-w-2xl">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

export const Default: StoryObj<typeof MultitaskGroup> = {
  args: {
    children: (
      <>
        <ItemRow
          item={itemInState("now", { title: "Podcast" })}
          timeZone={STORY_TIME_ZONE}
          onToggleDone={() => {}}
        />
        <ItemRow
          item={itemInState("now", { title: "Dishes" })}
          timeZone={STORY_TIME_ZONE}
          onToggleDone={() => {}}
        />
      </>
    ),
  },
};
