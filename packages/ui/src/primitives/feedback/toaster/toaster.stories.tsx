import type { Meta, StoryObj } from "@storybook/react";

import { UNDO_LONG_MS } from "@syn/constants";

import { Button } from "../../control/button";
import { Toaster, toast, toastUndo } from "./toaster";

/**
 * One toast at a time, bottom-centre, 4s, no icon, no close button
 * (official spec §9.7). Toasts carry undo and nothing else.
 */
const meta: Meta<typeof Toaster> = {
  title: "Primitives/Feedback/Toaster",
  component: Toaster,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Overview: Story = {
  tags: ["!autodocs"],
  render: () => (
    <div className="flex flex-col items-start gap-(--space-3) p-(--space-6)">
      <Button
        onClick={() =>
          toastUndo({
            text: "Done · Immediate wake up",
            onUndo: () => toast("Undone"),
          })
        }
      >
        toastUndo — 5s window
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toastUndo({
            text: "Applied Morning A",
            onUndo: () => toast("Undone"),
            durationMs: UNDO_LONG_MS,
          })
        }
      >
        toastUndo — 10s window
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          toast("First");
          toast("Second");
          toast("Third");
        }}
      >
        Three at once — only one shows
      </Button>
      <Toaster />
    </div>
  ),
};
