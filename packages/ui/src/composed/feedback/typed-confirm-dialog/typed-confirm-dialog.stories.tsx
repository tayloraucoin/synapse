import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { TypedConfirmDialog } from "./typed-confirm-dialog";

/**
 * ST-10a, Delete account, and nowhere else — the single surface where the
 * destructive token is permitted (official spec §9.3). Do not reach for this
 * to make another deletion feel serious.
 *
 * Type `delete` (any case, any surrounding space) to arm the confirm.
 */
const meta: Meta<typeof TypedConfirmDialog> = {
  title: "Composed/Feedback/TypedConfirmDialog",
  component: TypedConfirmDialog,
};

export default meta;

export const Interactive: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Delete account
        </Button>
        <TypedConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete your account?"
          description="Everything is removed. This cannot be undone."
          word="delete"
          inputLabel="Type delete to confirm"
          confirmLabel="Delete account"
          cancelLabel="Keep my account"
          onConfirm={() => setOpen(false)}
        />
      </div>
    );
  },
};
