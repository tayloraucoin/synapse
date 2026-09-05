import type { StateWordKind } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { STATE_WORDS } from "./copy";
import { StateWord } from "./state-word";

const meta: Meta<typeof StateWord> = {
  title: "Composed/Display/StateWord",
  component: StateWord,
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof StateWord>;

export const Now: Story = { args: { kind: "now", withDot: true } };

export const Moved: Story = { args: { kind: "moved" } };

export const CarriedFrom: Story = { args: { kind: "from", text: "Thu" } };

/** The undo takes the slot for five seconds; it is a real button. */
export const Undo: Story = {
  args: { kind: "updated", undo: { label: "Undo", onUndo: () => {} } },
};

/**
 * The closed vocabulary. Only `now` and `soon` may take the dot — the accent
 * means *this moment* and nothing else may borrow it (official spec §9.3).
 */
export const Vocabulary: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-(--space-2) p-(--space-6)">
      {(Object.keys(STATE_WORDS) as StateWordKind[]).map((kind) => (
        <StateWord
          key={kind}
          kind={kind}
          withDot
          text={kind === "from" ? "Thu" : kind === "add-unit" ? "pages" : undefined}
        />
      ))}
    </div>
  ),
};
