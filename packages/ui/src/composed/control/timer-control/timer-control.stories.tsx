import type { TimerStatus } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TimerDisplay } from "../../display/timer-display";
import { TimerControl } from "./timer-control";

/**
 * The positions never move: the left slot is always go/hold, the right is
 * always Stop. A control that reorders itself between states is how someone
 * stops a timer they meant to pause.
 */
const meta: Meta<typeof TimerControl> = {
  title: "Composed/Control/TimerControl",
  component: TimerControl,
  decorators: [(Story) => <div className="max-w-sm p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof TimerControl>;

const handlers = {
  onStart: () => {},
  onPause: () => {},
  onResume: () => {},
  onStop: () => {},
};

export const Idle: Story = { args: { status: "idle", ...handlers } };

export const Running: Story = { args: { status: "running", ...handlers } };

/** Pause is Phase 2; until then a running timer offers Stop alone. */
export const RunningWithPause: Story = {
  args: { status: "running", pauseEnabled: true, ...handlers },
};

export const Paused: Story = {
  args: { status: "paused", pauseEnabled: true, ...handlers },
};

/** With the display, as IT-01 shows it. */
export const WithDisplay: StoryObj = {
  render: function Render() {
    const [status, setStatus] = React.useState<TimerStatus>("idle");
    const [elapsed, setElapsed] = React.useState(0);

    React.useEffect(() => {
      if (status !== "running") return;
      const timer = window.setInterval(() => setElapsed((s) => s + 1), 1000);
      return () => window.clearInterval(timer);
    }, [status]);

    return (
      <div className="flex max-w-sm flex-col gap-(--space-4) p-(--space-6)">
        <TimerDisplay elapsedSec={elapsed} status={status} />
        <TimerControl
          status={status}
          pauseEnabled
          onStart={() => setStatus("running")}
          onPause={() => setStatus("paused")}
          onResume={() => setStatus("running")}
          onStop={() => {
            setStatus("idle");
            setElapsed(0);
          }}
        />
      </div>
    );
  },
};
