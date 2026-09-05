import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../control/button";
import { SheetPanel } from "./sheet";

const meta: Meta<typeof SheetPanel> = {
  title: "Primitives/Layout/Sheet",
  component: SheetPanel,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof SheetPanel>;

/** The wide right panel, 420px over a scrim. Compact uses `drawer`. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: function Overview() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button onClick={() => setOpen(true)}>Open the item sheet</Button>
        <SheetPanel
          open={open}
          onOpenChange={setOpen}
          title="Immediate wake up"
          description="7:20 · 15 min"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Not today
              </Button>
              <Button onClick={() => setOpen(false)}>Mark done</Button>
            </>
          }
        >
          <p className="text-text-body m-0">
            The body scrolls; the header and the footer stay put.
          </p>
        </SheetPanel>
      </div>
    );
  },
};
