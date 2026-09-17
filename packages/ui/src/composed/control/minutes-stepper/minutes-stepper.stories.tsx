import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { StatusLine } from "../../feedback/status-line";
import { MinutesStepper } from "./minutes-stepper";

/**
 * Buttons move by 5, typing allows 1 — the difference between adjusting and
 * specifying. Type 200 and blur: the value clamps to the habit's range and the
 * note says why, for two seconds. Silently rewriting the number is the thing
 * to avoid.
 *
 * UX v1.2 (RUN-7): the value changes on the tap; `onCommit` fires once after
 * 400ms of quiet. The *Optimistic* story logs every commit — tap five times
 * fast and read one line.
 */
const meta: Meta<typeof MinutesStepper> = {
  title: "Composed/Control/MinutesStepper",
  component: MinutesStepper,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<number | null>(30);
    return (
      <MinutesStepper
        label="Takes"
        helperText="Bounded to the habit's range."
        value={value}
        onChange={setValue}
        min={20}
        max={60}
      />
    );
  },
};

export const AtLowerBound: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<number | null>(20);
    return (
      <MinutesStepper
        label="Takes"
        value={value}
        onChange={setValue}
        min={20}
        max={60}
      />
    );
  },
};

export const WithError: StoryObj<typeof MinutesStepper> = {
  args: {
    label: "Takes",
    value: null,
    onChange: () => {},
    min: 20,
    max: 60,
    error: "Say how long this usually takes.",
  },
};

/** UX v1.2 §4.7 (RUN-10): the length row's stepper — 56px field, no suffix; the unit is in the name. */
export const Compact: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<number | null>(20);
    return (
      <MinutesStepper
        label="Length, Breakfast"
        value={value}
        onChange={setValue}
        min={1}
        max={480}
        compact
        className="[&>label]:sr-only"
      />
    );
  },
};

type OptimisticArgs = { slowNetwork: boolean; failCommits: boolean };

/**
 * The write is debounced and never disables the control. With *slow network*
 * the edge pulses for two seconds after the last tap; with *fail commits* the
 * value reverts to the last saved one and the screen's line says so.
 */
export const Optimistic: StoryObj<OptimisticArgs> = {
  args: { slowNetwork: true, failCommits: false },
  argTypes: {
    slowNetwork: { control: "boolean" },
    failCommits: { control: "boolean" },
  },
  render: function Render(args) {
    const [saved, setSaved] = React.useState<number | null>(30);
    const [log, setLog] = React.useState<string[]>([]);
    const [line, setLine] = React.useState<string | null>(null);

    const commit = async (next: number) => {
      setLine(null);
      await new Promise((resolve) => setTimeout(resolve, args.slowNetwork ? 2000 : 100));
      if (args.failCommits) throw new Error("offline");
      setSaved(next);
      setLog((entries) => [...entries, `commit ${next}`]);
    };

    return (
      <div className="flex flex-col gap-(--space-4)">
        <MinutesStepper
          label="Takes"
          value={saved}
          onCommit={commit}
          onCommitError={() => setLine("That didn't save. The value is back to what it was.")}
          min={5}
          max={120}
        />
        {line === null ? null : <StatusLine variant="sync-issues" text={line} placement="inline" />}
        <ol className="text-text-secondary m-0 list-decimal ps-(--space-5) text-(length:--fs-caption)">
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ol>
      </div>
    );
  },
};
