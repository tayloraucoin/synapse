import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { ListRow } from "../list-row";
import { ArchivedSection } from "./archived-section";

const meta: Meta<typeof ArchivedSection> = {
  title: "Composed/Display/ArchivedSection",
  component: ArchivedSection,
  decorators: [(Story) => <div className="max-w-2xl p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof ArchivedSection>;

export const Closed: Story = {
  args: {
    count: 3,
    children: (
      <ul className="divide-hairline divide-y">
        {["Old habit", "Retired routine", "Winter run"].map((title) => (
          <ListRow
            key={title}
            title={title}
            muted
            trailing={
              <Button variant="ghost" size="sm">
                Restore
              </Button>
            }
          />
        ))}
      </ul>
    ),
  },
};

export const Open: Story = { args: { ...Closed.args, defaultOpen: true } };

/** Nothing archived renders nothing — not a heading promising an empty list. */
export const Empty: Story = { args: { count: 0, children: null } };
