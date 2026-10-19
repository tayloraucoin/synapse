import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MonthGrid, type MonthGridProps } from "./month-grid";

/**
 * Pick a day's month (USE-29; D-USE-37): Monday first, past days faded and
 * closed, today ringed in ink, the picked day a filled ink disc, marked days
 * dotted. The month is the caller's; here a story holds it.
 */
const meta: Meta<typeof MonthGrid> = {
  title: "Composed/Control/MonthGrid",
  component: MonthGrid,
  decorators: [
    (Story) => (
      <div className="w-[362px] p-(--space-4)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof MonthGrid>;

function Held(props: Omit<MonthGridProps, "onPick" | "onMonth">) {
  const [month, setMonth] = React.useState(props.month);
  const [picked, setPicked] = React.useState(props.picked ?? null);
  return (
    <MonthGrid
      {...props}
      month={month}
      picked={picked}
      onMonth={setMonth}
      onPick={setPicked}
    />
  );
}

const TODAY = "2026-10-12";

/** Today alone, every day open. */
export const Today: Story = {
  render: () => <Held month="2026-10" today={TODAY} />,
};

/** A day picked: the filled ink disc. */
export const Picked: Story = {
  render: () => <Held month="2026-10" today={TODAY} picked="2026-10-15" />,
};

/** Past days faded and closed; ‹ muted at the first open month. */
export const PastDaysClosed: Story = {
  render: () => (
    <Held month="2026-10" today={TODAY} minDate={TODAY} picked="2026-10-15" />
  ),
};

/** Days already set, dotted under the number (Move to's). */
export const Marked: Story = {
  render: () => (
    <Held
      month="2026-10"
      today={TODAY}
      minDate={TODAY}
      picked="2026-10-15"
      marked={[
        "2026-10-12",
        "2026-10-13",
        "2026-10-14",
        "2026-10-15",
        "2026-10-16",
        "2026-10-17",
      ]}
      markLabel="Already set for that day"
    />
  ),
};

/** The four side by side, for the capture. */
export const All: Story = {
  decorators: [
    (Story) => (
      <div className="p-(--space-4)">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-2 gap-(--space-8)">
      {(
        [
          ["Today", {}],
          ["Picked", { picked: "2026-10-15" }],
          ["Past days closed", { minDate: TODAY, picked: "2026-10-15" }],
          [
            "Marked",
            {
              minDate: TODAY,
              picked: "2026-10-15",
              marked: ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15"],
              markLabel: "Already set for that day",
            },
          ],
        ] as const
      ).map(([label, props]) => (
        <div key={label} className="flex w-[362px] flex-col gap-(--space-2)">
          <p className="text-muted-foreground text-(length:--fs-caption)">
            {label}
          </p>
          <Held month="2026-10" today={TODAY} {...props} />
        </div>
      ))}
    </div>
  ),
};
