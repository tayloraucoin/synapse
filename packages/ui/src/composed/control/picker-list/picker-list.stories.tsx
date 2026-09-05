import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { PickerList } from "./picker-list";

/**
 * Active-descendant, not roving focus: the input keeps DOM focus the whole
 * time, so typing and arrowing are one gesture and the mobile keyboard does
 * not close on every arrow press. Try ↓ ↑ and Enter without leaving the field.
 *
 * Filtering matches title *and* meta, because in WK-02 the meta is what tells
 * two similarly named templates apart. The create row is never filtered away.
 */
const meta: Meta<typeof PickerList> = {
  title: "Composed/Control/PickerList",
  component: PickerList,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

const GROUPS = [
  {
    heading: "Habits",
    items: [
      {
        id: "run",
        title: "Morning run",
        meta: "30–45 min",
        icon: { kind: "emoji" as const, value: "🏃" },
      },
      {
        id: "read",
        title: "Read",
        meta: "20 min",
        icon: { kind: "emoji" as const, value: "📖" },
      },
    ],
  },
  {
    heading: "Deep work",
    items: [
      { id: "write", title: "Writing block", meta: "90 min", marker: true },
      { id: "review", title: "Code review", meta: "45 min", disabled: true },
    ],
  },
];

export const Inline: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("run");
    return (
      <PickerList
        groups={GROUPS}
        value={value}
        onSelect={(id) => setValue(id === "" ? null : id)}
        noneLabel="None"
        createLabel="New habit"
        onCreate={() => {}}
        searchLabel="Search habits"
        emptyText="No habits match that search."
      />
    );
  },
};

export const Popover: StoryObj = {
  render: () => (
    <PickerList
      groups={GROUPS}
      value={null}
      onSelect={() => {}}
      presentation="popover"
      searchLabel="Search habits"
      emptyText="No habits match that search."
    />
  ),
};
