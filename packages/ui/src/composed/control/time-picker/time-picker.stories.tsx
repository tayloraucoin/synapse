import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { TimePicker, TimePickerLists } from "./time-picker";

/**
 * The house's 24-hour picker (USE-141). A sheet below the split break, a
 * popover at it; resize the canvas to see both. The field beside it reads
 * each pick; Done keeps it, Escape puts back the opening time.
 */
const meta: Meta<typeof TimePicker> = {
  title: "Composed/Control/TimePicker",
  component: TimePicker,
  decorators: [(Story) => <div className="max-w-sm p-(--space-8)"><Story /></div>],
};

export default meta;

function Field({ start, open }: { start: string | null; open?: boolean }) {
  const [saved, setSaved] = React.useState<string | null>(start);
  const [shown, setShown] = React.useState<string | null>(start);
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  return (
    <div className="flex h-(--target) items-center justify-between rounded-(--radius-control) border border-input ps-(--space-3)">
      <span className="font-semibold tabular-nums">{shown ?? "7:00"}</span>
      <TimePicker
        label="Up at"
        value={saved}
        fallback="07:00"
        open={isOpen}
        onOpenChange={setIsOpen}
        onPreview={setShown}
        onCommit={(value) => {
          setSaved(value);
          setShown(value);
        }}
      />
    </div>
  );
}

export const Closed: StoryObj = { render: () => <Field start="06:30" /> };

/** The open state, for the review. */
export const Open: StoryObj = { render: () => <Field start="06:30" open /> };

/** A typed minute off the step: the minute list shows no pick. */
export const TypedMinute: StoryObj = { render: () => <Field start="07:03" open /> };

/** The lists alone, as the static test reads them. */
export const Lists: StoryObj = {
  render: function Render() {
    const [value, setValue] = React.useState("06:30");
    return <TimePickerLists value={value} onPick={setValue} />;
  },
};
