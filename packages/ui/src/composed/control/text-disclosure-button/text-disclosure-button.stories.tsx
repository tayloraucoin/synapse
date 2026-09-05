import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TextDisclosureButton } from "./text-disclosure-button";

/**
 * No chevron: the label itself changes, which is the honest affordance and the
 * one that survives a screen reader (official spec §9.9 — an icon never
 * carries the meaning alone).
 */
const meta: Meta<typeof TextDisclosureButton> = {
  title: "Composed/Control/TextDisclosureButton",
  component: TextDisclosureButton,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

export const Interactive: StoryObj = {
  render: function Render() {
    const [expanded, setExpanded] = React.useState(false);
    return (
      <TextDisclosureButton
        expanded={expanded}
        collapsedLabel="Show archived (3)"
        expandedLabel="Hide archived (3)"
        onClick={() => setExpanded((value) => !value)}
      />
    );
  },
};
