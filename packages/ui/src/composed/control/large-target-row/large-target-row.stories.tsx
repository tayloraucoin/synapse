import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { LargeTargetRow } from "./large-target-row";

/**
 * SF-01 step 1, answered while running late, one-handed, probably walking:
 * four 56px targets, no scrolling, no typing. The selected one fills so the
 * answer is visible from arm's length.
 */
const meta: Meta<typeof LargeTargetRow> = {
  title: "Composed/Control/LargeTargetRow",
  component: LargeTargetRow,
  decorators: [(Story) => <div className="max-w-lg p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <LargeTargetRow
        label="How far behind?"
        value={value}
        onChange={setValue}
        options={[
          { value: "15", label: "15 min" },
          { value: "30", label: "30 min" },
          { value: "60", label: "1 h" },
          { value: "custom", label: "Other" },
        ]}
      />
    );
  },
};

/**
 * UX v1.1 §4.1 (DYN-7): the four archetype cards, stacked, one live and
 * preselected; the other three at `text-text-disabled` with *not yet* on the
 * right — not tappable, not in the tab order, no explanation.
 */
export const Archetypes: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("own_structure_dynamic");
    return (
      <LargeTargetRow
        label="Which is closest?"
        layout="stacked"
        value={value}
        onChange={setValue}
        options={[
          { value: "consistent_shifts", label: "My shifts are the same every week", disabled: true, caption: "not yet" },
          { value: "varying_shifts", label: "My shifts change week to week", disabled: true, caption: "not yet" },
          {
            value: "own_structure_dynamic",
            label: "I set my own structure, and it changes",
            description: "Work starts around a time, not at one. Mornings bend.",
          },
          { value: "fluid", label: "My days are fluid", disabled: true, caption: "not yet" },
        ]}
      />
    );
  },
};

/** UX v1.1 §6.6 step 2: *what gives*, ordered by anchor direction. */
export const WhatGives: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <LargeTargetRow
        label="What gives?"
        layout="stacked"
        value={value}
        onChange={setValue}
        options={[
          { value: "slide", label: "Start work later", description: "Work moves to 9:40; everything slides." },
          { value: "hold", label: "Keep work at 9:00" },
        ]}
      />
    );
  },
};
