import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { ListRow } from "../../display/list-row";
import { EllipsesMenu } from "./ellipses-menu";

/**
 * No destructive variant. Official spec §9.3 permits the destructive token in
 * exactly one place — Delete account — and that surface is a
 * `TypedConfirmDialog`, not a menu row.
 *
 * The trigger stops propagation because the menu sits inside a row whose whole
 * surface is a link: without it, opening the menu also navigates.
 */
const meta: Meta<typeof EllipsesMenu> = {
  title: "Composed/Control/EllipsesMenu",
  component: EllipsesMenu,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof EllipsesMenu>;

export const Default: Story = {
  args: {
    label: "Actions for Weekday morning",
    items: [
      { label: "Move up", onClick: () => {} },
      { label: "Move down", onClick: () => {} },
      { label: "Duplicate", onClick: () => {} },
      { label: "Remove", onClick: () => {} },
    ],
  },
};

/** Rows the current state does not offer are hidden, not disabled. */
export const WithHiddenRows: Story = {
  args: {
    label: "Actions for the first slot",
    items: [
      { label: "Move up", onClick: () => {}, hidden: true },
      { label: "Move down", onClick: () => {} },
      { label: "Remove", onClick: () => {} },
    ],
  },
};

/** Inside a row: tab through it — the link, then the menu. Two stops. */
export const InsideARow: StoryObj = {
  render: () => (
    <ul className="divide-hairline divide-y">
      <ListRow
        title="Weekday morning"
        meta="6 items · 2 h 10 min"
        href="#"
        trailing={
          <EllipsesMenu
            label="Actions for Weekday morning"
            items={[{ label: "Duplicate", onClick: () => {} }]}
          />
        }
      />
    </ul>
  ),
};
