import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TimeField } from "./time-field";

/**
 * The native picker on both platforms (Epic 1 §0.3) — the wheel on iOS, the
 * dial on Android. A custom picker would be a worse version of both plus a
 * keyboard story to write.
 *
 * The value is "HH:mm", a wall-clock string: a template slot has no date, so
 * it cannot be a `Date`.
 */
const meta: Meta<typeof TimeField> = {
  title: "Composed/Control/TimeField",
  component: TimeField,
  decorators: [(Story) => <div className="max-w-xs p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("07:00");
    return <TimeField label="Starts at" value={value} onChange={setValue} />;
  },
};

export const Bounded: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<string | null>("07:20");
    return (
      <TimeField
        label="Started"
        helperText="Between waking and now."
        min="06:00"
        max="09:00"
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithError: StoryObj<typeof TimeField> = {
  args: {
    label: "Starts at",
    value: null,
    onChange: () => {},
    error: "Pick a time.",
  },
};

/** UX v1.1 §4, W1 (DYN-10): a pre-filled field shows its value with *Change*; the picker opens on demand. */
export const Disclosed: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("09:00");
    return (
      <div className="flex max-w-sm flex-col gap-(--space-4)">
        <TimeField label="Working by" value={value} onChange={setValue} disclosed />
        <TimeField label="Until about" value="17:30" onChange={() => {}} disclosed />
      </div>
    );
  },
};

/**
 * UX v1.2 §4 (RUN-7): *Change* opens the picker with *Done* beside it; *Done*,
 * Enter, Escape or leaving the field returns it to the value line, and focus
 * lands back on *Change*. `leading` is the person's emoji through `EmojiSlot`.
 */
export const DisclosedWithDone: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("07:00");
    return (
      <div className="flex max-w-sm flex-col gap-(--space-4)">
        <TimeField
          label="Wake"
          value={value}
          onChange={setValue}
          disclosed
          leading={{ kind: "emoji", value: "🌅" }}
        />
      </div>
    );
  },
};

/** The open state, for the review: the picker, *Done*, the leading slot. */
export const DisclosedOpen: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("07:00");
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      ref.current?.querySelector("button")?.click();
    }, []);
    return (
      <div ref={ref} className="flex max-w-sm flex-col gap-(--space-4)">
        <TimeField
          label="Wake"
          value={value}
          onChange={setValue}
          disclosed
          leading={{ kind: "emoji", value: "🌅" }}
        />
      </div>
    );
  },
};
