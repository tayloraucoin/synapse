import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { DiscardDialog } from "./discard-dialog";

/**
 * Neither action is destructive: losing an unsaved draft is a normal outcome,
 * and the red token belongs to exactly one surface (official spec §9.3).
 * Cancel — *Keep editing* — takes initial focus, so a stray Enter is safe.
 */
const meta: Meta<typeof DiscardDialog> = {
  title: "Composed/Feedback/DiscardDialog",
  component: DiscardDialog,
};

export default meta;

export const Interactive: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button onClick={() => setOpen(true)}>Leave the form</Button>
        <DiscardDialog
          open={open}
          onKeepEditing={() => setOpen(false)}
          onDiscard={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const Open: StoryObj<typeof DiscardDialog> = {
  args: { open: true, onKeepEditing: () => {}, onDiscard: () => {} },
};
