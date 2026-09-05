import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { ShortcutsDialog } from "./shortcuts-dialog";

/**
 * Wide only. There are no keyboard shortcuts on a phone, and a dialog opened
 * there would be a dead end — the caller gates on `useIsWide`.
 */
const meta: Meta<typeof ShortcutsDialog> = {
  title: "Composed/Feedback/ShortcutsDialog",
  component: ShortcutsDialog,
};

export default meta;

const SHORTCUTS = [
  { keys: ["j"], label: "Next item" },
  { keys: ["k"], label: "Previous item" },
  { keys: ["Space"], label: "Mark done" },
  { keys: ["Enter"], label: "Open item" },
  { keys: ["s"], label: "Start or stop the timer" },
  { keys: ["?"], label: "Keyboard shortcuts" },
];

export const Interactive: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Show shortcuts
        </Button>
        <ShortcutsDialog
          open={open}
          onOpenChange={setOpen}
          shortcuts={SHORTCUTS}
        />
      </div>
    );
  },
};
