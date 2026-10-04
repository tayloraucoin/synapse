import type { Meta, StoryObj } from "@storybook/react";

import { EllipsesMenu } from "../../control/ellipses-menu";
import { LANE_HEADER_COPY } from "./copy";
import { LaneHeader } from "./lane-header";

/**
 * A lane's head. Folded, it still says what is inside: the mark if something
 * fires, *next* if next is there. The hue is a 2px edge with the name beside
 * it, never alone. *No group* is the plain form.
 */
const meta: Meta<typeof LaneHeader> = {
  title: "Composed/Display/LaneHeader",
  component: LaneHeader,
  args: {
    name: "Northwind",
    hue: "leaf",
    collapsed: false,
    onCollapsedChange: () => {},
    menu: (
      <EllipsesMenu
        label="Northwind options"
        items={[{ label: "First today" }, { label: "Rename" }, { label: "Colour" }, { label: "Archive group" }]}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-(--content-text)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LaneHeader>;

export const Expanded: Story = {};

export const Collapsed: Story = { args: { collapsed: true } };

export const CollapsedWithMark: Story = { args: { collapsed: true, hasFiring: true } };

export const CollapsedWithNext: Story = { args: { collapsed: true, hasNext: true } };

export const CollapsedWithBoth: Story = { args: { collapsed: true, hasFiring: true, hasNext: true } };

/** Expanded, the mark and *next* are on the rows — the head shows neither. */
export const ExpandedIgnoresMarkAndNext: Story = { args: { hasFiring: true, hasNext: true } };

export const FirstToday: Story = { args: { firstToday: true, name: "Harbor", hue: "sky" } };

export const Plain: Story = {
  name: "Plain (No group)",
  args: { name: LANE_HEADER_COPY.noGroup, hue: null, plain: true },
};
