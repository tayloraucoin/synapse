import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { ITEM } from "../../__fixtures__/view-models";
import type { Stepper17Value } from "../stepper-17";
import { ReflectionBlock, type ReflectionAxis } from "./reflection-block";

/**
 * `captions={false}` on the steppers: a column of four "less … more" pairs is
 * noise once the first has taught the scale.
 *
 * The axes are the habit's own, passed in — nothing here knows what "focus"
 * means, which is what keeps the block usable for a habit with one axis and
 * one with four.
 */
const meta: Meta<typeof ReflectionBlock> = {
  title: "Composed/Control/ReflectionBlock",
  component: ReflectionBlock,
  decorators: [(Story) => <div className="max-w-lg p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [axes, setAxes] = React.useState<ReflectionAxis[]>([
      { key: "effort", label: "Effort", value: null },
      { key: "focus", label: "Focus", value: null },
    ]);
    const [note, setNote] = React.useState("");

    return (
      <ReflectionBlock
        item={ITEM}
        axes={axes}
        note={note}
        onRate={(key, value: Stepper17Value) =>
          setAxes((current) =>
            current.map((axis) =>
              axis.key === key ? { ...axis, value } : axis,
            ),
          )
        }
        onNoteChange={setNote}
      />
    );
  },
};

export const SingleAxis: StoryObj<typeof ReflectionBlock> = {
  args: {
    item: ITEM,
    axes: [{ key: "effort", label: "Effort", value: 5 }],
    note: "Legs heavy, but it went fine once I started.",
    onRate: () => {},
    onNoteChange: () => {},
  },
};
