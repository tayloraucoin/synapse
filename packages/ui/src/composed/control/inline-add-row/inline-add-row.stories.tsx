import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Text } from "../../../primitives/typography/text";
import { InlineAddRow, type InlineAddRowProps } from "./inline-add-row";

/**
 * A ghost row that becomes a field — no button. `Enter` adds, `Esc` or an
 * empty blur closes. The stories log what was submitted under the row.
 */
const meta: Meta<typeof InlineAddRow> = {
  title: "Composed/Control/InlineAddRow",
  component: InlineAddRow,
  args: { label: "Add a task", placeholder: "Task", maxLength: 120, onSubmit: () => {} },
  decorators: [
    (Story) => (
      <div className="max-w-(--board-col-wide)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof InlineAddRow>;

function WithLog(props: InlineAddRowProps) {
  const [added, setAdded] = React.useState<string[]>([]);
  return (
    <div className="flex flex-col gap-(--space-2)">
      <InlineAddRow {...props} onSubmit={(value) => setAdded((list) => [...list, value])} />
      {added.map((value, index) => (
        <Text key={`${value}-${index}`} as="p" variant="secondary" tone="secondary">
          {value}
        </Text>
      ))}
    </div>
  );
}

export const Resting: Story = {};

export const Editing: Story = { args: { open: true } };

export const KeepsOpen: Story = {
  name: "Keeps open",
  args: { keepOpen: true },
  render: (args) => <WithLog {...args} />,
};

export const Disabled: Story = { args: { disabled: true } };

export const AddAGroup: Story = {
  name: "Add a group",
  args: { label: "Add a group", placeholder: "Group, usually a client", maxLength: 40 },
  render: (args) => <WithLog {...args} />,
};
