import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { ActionRowSheet } from "./action-row-sheet";

/**
 * DH-01. Rows the day state does not offer are hidden, not disabled — a
 * closed day has no *Shift the day*, and greying it out invites a person to
 * work out why.
 */
const meta: Meta<typeof ActionRowSheet> = {
  title: "Composed/Layout/ActionRowSheet",
  component: ActionRowSheet,
};

export default meta;

function Demo({ closed }: { closed: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="p-(--space-6)">
      <Button onClick={() => setOpen(true)}>Day options</Button>
      <ActionRowSheet
        open={open}
        onOpenChange={setOpen}
        title="Friday 4 Sept"
        subtitle="Weekday morning · Woke 7:02"
        closeLabel="Close"
        rows={[
          { label: "Set wake time", onSelect: () => {} },
          { label: "Shift the day", onSelect: () => {}, hidden: closed },
          { label: "I have less time today", onSelect: () => {}, hidden: closed },
          { label: "Add a one-off", onSelect: () => {} },
        ]}
      />
    </div>
  );
}

export const LiveDay: StoryObj = { render: () => <Demo closed={false} /> };

export const ClosedDay: StoryObj = { render: () => <Demo closed /> };
