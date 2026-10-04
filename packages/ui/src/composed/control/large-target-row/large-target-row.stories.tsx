import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { LargeTargetRow } from "./large-target-row";

/**
 * SF-01 step 1, answered while running late, one-handed, probably walking:
 * four 56px targets, no scrolling, no typing.
 *
 * UX v1.3 R56 (DAY-1): the chosen option is surface, a 1.5px ink border and a
 * check (stacked) — the grammar `SelectRow` has. The ink fill is the primary
 * button's alone; *Stacked, one selected, beside a primary* is the canvas
 * that proves it.
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

/**
 * Workflow WF-03 (FLO-8): `trailing` — a saved template's menu BESIDE its card,
 * outside the label, so pressing it never chooses the option. The built-in
 * two carry none; nothing is preselected.
 */
export const WithTrailing: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>(null);
    const menu = (name: string) => (
      <Button variant="ghost" size="icon" aria-label={`${name} options`}>
        ⋮
      </Button>
    );
    return (
      <LargeTargetRow
        label="Start from"
        layout="stacked"
        value={value}
        onChange={setValue}
        options={[
          { value: "starter:working", label: "Working", description: "In progress · Ongoing · Finish later · Done" },
          { value: "starter:queue", label: "Queue", description: "Up next · Later · Someday" },
          { value: "t-reviews", label: "Reviews", description: "Asked · Waiting · Read", trailing: menu("Reviews") },
        ]}
      />
    );
  },
};

/**
 * UX v1.2 (RUN-7): `leading` — the person's emoji through `EmojiSlot`, in the
 * 44px square. A disabled option fades its glyph with the rest.
 */
export const WithLeading: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("gym");
    return (
      <LargeTargetRow
        label="Where"
        layout="stacked"
        value={value}
        onChange={setValue}
        options={[
          { value: "gym", label: "Gym", description: "Travel there and back.", leading: { kind: "emoji", value: "🏋️" } },
          { value: "home", label: "Home", leading: { kind: "emoji", value: "🏠" } },
          { value: "outside", label: "Outside", leading: { kind: "emoji", value: "🌳" } },
          { value: "pool", label: "Pool", disabled: true, caption: "not yet", leading: { kind: "emoji", value: "🏊" } },
        ]}
      />
    );
  },
};

/**
 * UX v1.3 R56 (DAY-1): one option chosen, with the screen's primary under the
 * rows. The primary is the only ink fill on the canvas; the chosen card reads
 * as a choice — surface, a 1.5px ink border, the check in the trailing slot.
 */
export const StackedOneSelectedBesideAPrimary: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("slide");
    return (
      <div className="flex flex-col gap-(--space-5)">
        <LargeTargetRow
          label="What gives?"
          layout="stacked"
          value={value}
          onChange={setValue}
          options={[
            { value: "slide", label: "Work waits", description: "Work starts when the routine is done." },
            { value: "cut", label: "The routine gets cut", description: "Work starts on time; the routine shortens." },
            { value: "depends", label: "Depends on the day", description: "The morning asks." },
          ]}
        />
        <div className="flex justify-end">
          <Button>Continue</Button>
        </div>
      </div>
    );
  },
};

/** The row layout: border and surface carry the choice; no check — four cells have no trailing slot. */
export const RowOneSelected: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("30");
    return (
      <div className="max-w-[375px]">
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
      </div>
    );
  },
};

/** Tab to the group: the ring sits on the focused option. */
export const FocusVisible: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("cut");
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      ref.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    }, []);
    return (
      <div ref={ref}>
        <LargeTargetRow
          label="What gives?"
          layout="stacked"
          value={value}
          onChange={setValue}
          options={[
            { value: "slide", label: "Work waits" },
            { value: "cut", label: "The routine gets cut" },
            { value: "depends", label: "Depends on the day" },
          ]}
        />
      </div>
    );
  },
};
