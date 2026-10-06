import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Stepper17, type Stepper17Value } from "./stepper-17";

/**
 * Native radios, so arrow keys, Tab-as-one-stop and the announcement come from
 * the browser. Number keys 1–7 select directly (cross-cutting §3.3) — click
 * a cell, then press 4.
 *
 * Never the accent: in this product accent-500 means *now*, and a rating is
 * not a moment in the day.
 */
const meta: Meta<typeof Stepper17> = {
  title: "Composed/Control/Stepper17",
  component: Stepper17,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

function Controlled(props: {
  initial?: Stepper17Value | null;
  resting?: Stepper17Value | null;
  captions?: boolean;
  error?: string;
}) {
  const [value, setValue] = React.useState<Stepper17Value | null>(
    props.initial ?? null,
  );
  return (
    <Stepper17
      label="Importance"
      helperText="How much this matters, in general."
      value={value}
      onChange={setValue}
      resting={props.resting}
      onReset={
        props.resting === undefined ? undefined : () => setValue(null)
      }
      captions={props.captions}
      error={props.error}
    />
  );
}

export const Empty: StoryObj = { render: () => <Controlled /> };

export const Selected: StoryObj = { render: () => <Controlled initial={5} /> };

/** The dashed ring is the life default, shown while nothing is chosen. */
export const WithResting: StoryObj = {
  render: () => <Controlled resting={4} />,
};

export const NoCaptions: StoryObj = {
  render: () => <Controlled initial={3} captions={false} />,
};

/** The error is a sentence in ink — never a red field (official spec §9.3). */
export const Error: StoryObj = {
  render: () => <Controlled error="Pick a number from 1 to 7." />,
};

export const Disabled: StoryObj<typeof Stepper17> = {
  args: {
    label: "Importance",
    value: 5,
    onChange: () => {},
    disabled: true,
  },
};

/**
 * UX v1.2 §4.9 — seven 40px squares (304px with the gaps) on one line in a
 * 375px sheet with 16px gutters; 4+3 at 200% text. The wrapper here undoes
 * the meta decorator's 32px padding so the story measures like the sheet.
 */
export const Row: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState<Stepper17Value | null>(4);
    return (
      <div className="-mx-(--space-6) max-w-[343px]">
        <Stepper17 layout="row" label="Priority" value={value} onChange={setValue} />
      </div>
    );
  },
};

type OptimisticArgs = { slowNetwork: boolean; failCommits: boolean };

/**
 * UX v1.2 (RUN-7): the chosen cell fills on the tap; `onCommit` fires once
 * after 400ms of quiet; the group's edge pulses while the write is out and
 * every cell stays tappable. A failed write reverts to the saved value.
 */
export const Optimistic: StoryObj<OptimisticArgs> = {
  args: { slowNetwork: true, failCommits: false },
  argTypes: {
    slowNetwork: { control: "boolean" },
    failCommits: { control: "boolean" },
  },
  render: function Render(args) {
    const [saved, setSaved] = React.useState<Stepper17Value | null>(4);
    const [log, setLog] = React.useState<string[]>([]);
    return (
      <div className="flex flex-col gap-(--space-4)">
        <Stepper17
          layout="row"
          label="Priority"
          value={saved}
          onCommit={async (next) => {
            await new Promise((resolve) => setTimeout(resolve, args.slowNetwork ? 2000 : 100));
            // `Error` is a story name in this file; the global is reached by name.
            if (args.failCommits) throw new globalThis.Error("offline");
            setSaved(next);
            setLog((entries) => [...entries, `commit ${next}`]);
          }}
          onCommitError={() => setLog((entries) => [...entries, "reverted"])}
        />
        <ol className="text-text-secondary m-0 list-decimal ps-(--space-5) text-(length:--fs-caption)">
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ol>
      </div>
    );
  },
};
