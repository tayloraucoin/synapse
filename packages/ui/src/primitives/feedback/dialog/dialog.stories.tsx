import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../control/button";
import { DialogPanel } from "./dialog";

const meta: Meta<typeof DialogPanel> = {
  title: "Primitives/Feedback/Dialog",
  component: DialogPanel,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof DialogPanel>;

/** At most 320px compact, 420px wide. A dialog is a decision, not a form. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: function Overview() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button onClick={() => setOpen(true)}>Open</Button>
        <DialogPanel
          open={open}
          onOpenChange={setOpen}
          title="Apply Morning A to Tuesday?"
          description="Tuesday already has a template."
        >
          <div className="flex flex-col gap-(--space-2)">
            <Button>Replace it</Button>
            <Button variant="secondary">Add to it</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogPanel>
      </div>
    );
  },
};
