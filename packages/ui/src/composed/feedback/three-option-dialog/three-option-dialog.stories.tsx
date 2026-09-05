import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { ThreeOptionDialog } from "./three-option-dialog";

/**
 * TP-04. Three outcomes, none of them a cancel — which is why this is not a
 * `ConfirmDialog`: a two-button dialog would hide the third behind Esc.
 *
 * The buttons stack vertically. Three side by side make a person compare
 * lengths instead of reading, and on compact they wrap into an accidental
 * order.
 */
const meta: Meta<typeof ThreeOptionDialog> = {
  title: "Composed/Feedback/ThreeOptionDialog",
  component: ThreeOptionDialog,
};

export default meta;

export const ApplyChanges: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button onClick={() => setOpen(true)}>Save the template</Button>
        <ThreeOptionDialog
          open={open}
          onOpenChange={setOpen}
          title="Apply to days already planned?"
          body="Weekday morning is on Tuesday, Wednesday and Thursday."
          options={[
            {
              label: "Apply to all three",
              onSelect: () => setOpen(false),
              emphasis: "default",
            },
            {
              label: "Apply from tomorrow",
              onSelect: () => setOpen(false),
              emphasis: "secondary",
            },
            {
              label: "Don't apply",
              onSelect: () => setOpen(false),
              emphasis: "ghost",
            },
          ]}
        />
      </div>
    );
  },
};
