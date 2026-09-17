import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { CountStepper } from "./count-stepper";

/**
 * TP-02's weekly target. Distinct from `MinutesStepper` because the units
 * differ in kind: minutes are a duration a person estimates, a target is a
 * count they decide.
 */
const meta: Meta<typeof CountStepper> = {
  title: "Composed/Control/CountStepper",
  component: CountStepper,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

function Controlled({ initial }: { initial: number }) {
  const [value, setValue] = React.useState(initial);
  return (
    <CountStepper
      label="Days this week"
      helperText="How often you mean to run this."
      value={value}
      onChange={setValue}
      min={0}
      max={7}
      zeroLabel="none"
    />
  );
}

export const Default: StoryObj = { render: () => <Controlled initial={3} /> };

/** Zero is a real choice — the word says so where the digit reads as empty. */
export const Zero: StoryObj = { render: () => <Controlled initial={0} /> };

export const AtMax: StoryObj = { render: () => <Controlled initial={7} /> };

type OptimisticArgs = { slowNetwork: boolean; failCommits: boolean };

/**
 * UX v1.2 (RUN-7): five fast taps are one commit after 400ms of quiet; the
 * edge pulses while the write is out and the control stays tappable. A
 * failed write reverts to the saved value.
 */
export const Optimistic: StoryObj<OptimisticArgs> = {
  args: { slowNetwork: true, failCommits: false },
  argTypes: {
    slowNetwork: { control: "boolean" },
    failCommits: { control: "boolean" },
  },
  render: function Render(args) {
    const [saved, setSaved] = React.useState(3);
    const [log, setLog] = React.useState<string[]>([]);
    return (
      <div className="flex flex-col gap-(--space-4)">
        <CountStepper
          label="Days this week"
          value={saved}
          min={0}
          max={7}
          zeroLabel="none"
          onCommit={async (next) => {
            await new Promise((resolve) => setTimeout(resolve, args.slowNetwork ? 2000 : 100));
            if (args.failCommits) throw new Error("offline");
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
