import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../control/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";

const meta: Meta<typeof Drawer> = {
  title: "Primitives/Layout/Drawer",
  component: Drawer,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

/** The compact bottom sheet — kept for the drag handle and drag-to-dismiss. */
export const Overview: Story = {
  tags: ["!autodocs"],
  render: function Overview() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Shift my day</DrawerTitle>
              <DrawerDescription>How far forward?</DrawerDescription>
            </DrawerHeader>
            <div className="p-(--space-4)">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};
