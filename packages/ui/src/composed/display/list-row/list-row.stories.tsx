import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { EllipsesMenu } from "../../control/ellipses-menu";
import { ItemIcon } from "../item-icon";
import { ListRow } from "./list-row";

const meta: Meta<typeof ListRow> = {
  title: "Composed/Display/ListRow",
  component: ListRow,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ul className="divide-hairline max-w-2xl divide-y">
        <Story />
      </ul>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ListRow>;

export const Link: Story = {
  args: {
    title: "Morning run",
    meta: "30–45 min · importance 5",
    href: "#",
    leading: <ItemIcon icon={{ kind: "emoji", value: "🏃" }} />,
    chip: { key: "leaf", name: "Health" },
  },
};

export const Button: Story = {
  args: { title: "Deep work", meta: "90 min", onClick: () => {} },
};

/**
 * The trailing menu is a SIBLING of the row's link, never nested inside it —
 * a link containing a button is invalid, and in practice one of the two stops
 * working. Tab through this row: two stops, in order.
 */
export const WithOverflowMenu: Story = {
  args: {
    title: "Weekday morning",
    meta: "6 items · 2 h 10 min",
    href: "#",
    trailing: (
      <EllipsesMenu
        label="Actions for Weekday morning"
        items={[
          { label: "Duplicate", onClick: () => {} },
          { label: "Archive", onClick: () => {} },
        ]}
      />
    ),
  },
};

export const Wide: Story = {
  args: {
    title: "Weekday morning",
    meta: "2 of 2",
    layout: "wide",
    href: "#",
  },
};

export const Muted: Story = {
  args: { title: "Old habit", tag: "archived", muted: true, href: "#" },
};

/** UX v1.2 (RUN-7): `leading` as an `IconValue` renders through `EmojiSlot` — the 44px square, `aria-hidden`. */
export const WithLeadingEmoji: Story = {
  args: {
    title: "Stretch",
    meta: "5–10 min · importance 4",
    leading: { kind: "emoji", value: "🧘" },
    href: "#",
  },
};
