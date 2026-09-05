import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { STORY_TIME_ZONE, itemInState } from "../../__fixtures__/view-models";
import { ItemRow } from "../item-row";
import { ExpanderSection } from "./expander-section";

const meta: Meta<typeof ExpanderSection> = {
  title: "Composed/Display/ExpanderSection",
  component: ExpanderSection,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-2xl py-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof ExpanderSection>;

const rows = (
  <ul>
    {["Stretch", "Journal"].map((title) => (
      <ItemRow
        key={title}
        item={itemInState("not-assigned", { title })}
        variant="read-only"
        timeZone={STORY_TIME_ZONE}
      />
    ))}
  </ul>
);

/** LS-02 — the explanation is inside, so a closed section is one line. */
export const NotAssigned: Story = {
  args: {
    heading: "2 not assigned today",
    explanation:
      "These are in your library but not on today's template.",
    children: rows,
  },
};

export const Open: Story = { args: { ...NotAssigned.args, open: true } };
