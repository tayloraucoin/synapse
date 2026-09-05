import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../control/button";
import { ConfirmDialog } from "./alert-dialog";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Primitives/Feedback/AlertDialog",
  component: ConfirmDialog,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

/**
 * `confirmLabel` and `cancelLabel` are required — "Confirm" names nothing, and
 * the label has to say what happens (§10.3). Initial focus is on cancel.
 */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: function Overview() {
    const [open, setOpen] = React.useState(false);
    const [destructive, setDestructive] = React.useState(false);
    return (
      <div className="flex gap-(--space-3) p-(--space-6)">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Discard prompt
        </Button>
        <Button variant="secondary" onClick={() => setDestructive(true)}>
          Delete account
        </Button>

        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Discard changes?"
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          onConfirm={() => setOpen(false)}
        />

        <ConfirmDialog
          open={destructive}
          onOpenChange={setDestructive}
          variant="destructive"
          title="Delete your account?"
          description="Everything goes with it. This cannot be undone."
          confirmLabel="Delete everything"
          cancelLabel="Keep my account"
          onConfirm={() => setDestructive(false)}
        />
      </div>
    );
  },
};
