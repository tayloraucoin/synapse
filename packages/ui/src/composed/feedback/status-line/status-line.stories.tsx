import type { StatusLineVariant } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { STATUS_LINE_COPY } from "./copy";
import { InstallLine, TimezoneLine, UpdateLine } from "./presets";
import { StatusLine } from "./status-line";

/**
 * Never an alert and never a colour: official spec §9.3 keeps anything amber
 * or red off the tabs, and the words carry the whole message. That is also
 * why the variant chooses copy rather than a hue.
 */
const meta: Meta<typeof StatusLine> = {
  title: "Composed/Feedback/StatusLine",
  component: StatusLine,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof StatusLine>;

/** Not dismissable — a person needs to know their changes are local. */
export const Offline: Story = { args: { variant: "offline" } };

export const LateOffer: Story = {
  args: {
    variant: "late-offer",
    action: { label: "Shift the day", onClick: () => {} },
    onDismiss: () => {},
  },
};

export const Update: StoryObj = { render: () => <UpdateLine onReload={() => {}} /> };

export const Timezone: StoryObj = {
  render: () => (
    <TimezoneLine
      deviceZone="Europe/Berlin"
      storedZone="America/Vancouver"
      onSwitch={() => {}}
      onDismiss={() => {}}
    />
  ),
};

export const Install: StoryObj = {
  render: () => <InstallLine onHow={() => {}} onDismiss={() => {}} />,
};

/**
 * All ten. Three of these lines — setup, pending-review, permission — are
 * marked `[COPY — needs Vesper sign-off]` in `copy.ts`.
 */
export const AllVariants: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-(--space-2)">
      {(Object.keys(STATUS_LINE_COPY) as StatusLineVariant[]).map((variant) => {
        const copy = STATUS_LINE_COPY[variant];
        return (
          <StatusLine
            key={variant}
            variant={variant}
            action={
              copy.actionLabel === undefined
                ? undefined
                : { label: copy.actionLabel, onClick: () => {} }
            }
            onDismiss={copy.dismissLabel === undefined ? undefined : () => {}}
          />
        );
      })}
    </div>
  ),
};
