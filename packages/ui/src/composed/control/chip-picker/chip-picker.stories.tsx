import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { ChipPicker } from "./chip-picker";

/**
 * Selected is a 1px ink outline, not a fill: category chips already carry
 * their own hue, and filling one would produce a colour pair the token file
 * never authored.
 *
 * "None" is always first and always present — no category is a real answer.
 */
const meta: Meta<typeof ChipPicker> = {
  title: "Composed/Control/ChipPicker",
  component: ChipPicker,
  decorators: [(Story) => <div className="max-w-lg p-(--space-6)"><Story /></div>],
};

export default meta;

const OPTIONS = [
  { value: "health", label: "Health", colorKey: "leaf" as const },
  { value: "deep-work", label: "Deep work", colorKey: "sky" as const },
  { value: "home", label: "Home", colorKey: "clay" as const },
  { value: "people", label: "People", colorKey: "rose" as const },
];

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("health");
    return (
      <ChipPicker
        label="Category"
        options={OPTIONS}
        value={value}
        onChange={setValue}
        noneLabel="None"
        createLabel="New category"
        onCreate={() => {}}
      />
    );
  },
};

export const NoneSelected: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <ChipPicker
        label="Category"
        options={OPTIONS}
        value={value}
        onChange={setValue}
        noneLabel="None"
      />
    );
  },
};

/**
 * UX v1.2 §4.4 (RUN-8): a vocabulary of kinds — each with its glyph as data,
 * no *None* chip, nothing chosen until the person chooses.
 */
export const KindsWithGlyphs: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>(null);
    return (
      <ChipPicker
        label="Kind"
        options={[
          { value: "meeting", label: "Meeting", icon: { kind: "emoji", value: "🗣️" } },
          { value: "appointment", label: "Appointment", icon: { kind: "emoji", value: "📌" } },
          { value: "class", label: "Class", icon: { kind: "emoji", value: "🎓" } },
          { value: "other", label: "Other", icon: { kind: "emoji", value: "📍" } },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};
