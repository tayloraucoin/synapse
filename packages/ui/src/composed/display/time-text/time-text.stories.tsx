import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Caption } from "../../../primitives/typography/text";
import { STORY_TIME_ZONE } from "../../__fixtures__/view-models";
import { TimeText } from "./time-text";

const start = new Date(Date.UTC(2026, 8, 4, 14, 0));
const end = new Date(Date.UTC(2026, 8, 4, 17, 0));
const actual = new Date(Date.UTC(2026, 8, 4, 16, 32));

const meta: Meta<typeof TimeText> = {
  title: "Composed/Display/TimeText",
  component: TimeText,
  args: { timeZone: STORY_TIME_ZONE, start, end },
  decorators: [(Story) => <div className="p-(--space-6)"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof TimeText>;

export const At: Story = { args: { mode: "at" } };

/** A window drops the shared meridiem: "7:00–10:00", not "7:00 AM–10:00 AM". */
export const Window: Story = { args: { mode: "window" } };

export const Anytime: Story = { args: { mode: "anytime" } };

export const Actual: Story = { args: { mode: "actual", actual } };

export const Elapsed: Story = { args: { mode: "elapsed", elapsedSec: 3661 } };

/**
 * The zone is the DAY'S, not the viewer's. The same instant, read in three
 * zones — this is the difference the whole component exists for
 * (cross-cutting §7.3).
 */
export const SameInstantThreeZones: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-(--space-3) p-(--space-6)">
      {["America/Vancouver", "America/Toronto", "Europe/Berlin"].map((zone) => (
        <div key={zone} className="flex items-baseline gap-(--space-3)">
          <Caption as="span" className="w-44">
            {zone}
          </Caption>
          <TimeText mode="window" start={start} end={end} timeZone={zone} />
        </div>
      ))}
    </div>
  ),
};
