import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { StarterSetChooser, type StarterSetItem } from "./starter-set-chooser";

/**
 * FR-02, and LB-01's empty state. Already-added rows read *Added* and cannot
 * be selected — coming back and being offered the same ten with no sign of
 * which are already in the library is how a person ends up with two "Read"
 * habits.
 *
 * The footer count is a fact about the selection, not a target. Nothing here
 * says how many a person ought to pick.
 */
const meta: Meta<typeof StarterSetChooser> = {
  title: "Composed/Control/StarterSetChooser",
  component: StarterSetChooser,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-xl p-(--space-6)"><Story /></div>],
};

export default meta;

const ITEMS: readonly StarterSetItem[] = [
  {
    id: "wake",
    title: "Wake up",
    rangeLabel: "—",
    importance: 7,
    wakeAnchor: true,
    added: true,
  },
  { id: "run", title: "Morning run", rangeLabel: "30–45 min", importance: 5, added: false },
  { id: "read", title: "Read", rangeLabel: "20–40 min", importance: 4, added: false },
  { id: "write", title: "Deep work", rangeLabel: "60–90 min", importance: 6, added: false },
  { id: "walk", title: "Evening walk", rangeLabel: "20–30 min", importance: 3, added: false },
];

export const Default: StoryObj = {
  render: function Render() {
    const [selected, setSelected] = React.useState<ReadonlySet<string>>(
      new Set(["run"]),
    );
    return (
      <StarterSetChooser
        items={ITEMS}
        selected={selected}
        onToggle={(id) => {
          const next = new Set(selected);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          setSelected(next);
        }}
        onAdd={() => {}}
        onClose={() => {}}
      />
    );
  },
};

/** Nothing picked: *Add 0 selected* is disabled. */
export const NothingSelected: StoryObj<typeof StarterSetChooser> = {
  args: {
    items: ITEMS,
    selected: new Set<string>(),
    onToggle: () => {},
    onAdd: () => {},
    onClose: () => {},
  },
};
