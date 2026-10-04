import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { DiscardDialog } from "../../feedback/discard-dialog";
import { ResponsiveSheet } from "./responsive-sheet";

/**
 * One API, two shapes. Resize the Storybook viewport across 768px: below it a
 * Vaul drawer with a drag handle, above it a right-hand sheet. Nothing about
 * the caller changes.
 */
const meta: Meta<typeof ResponsiveSheet> = {
  title: "Composed/Layout/ResponsiveSheet",
  component: ResponsiveSheet,
};

export default meta;

const body = (
  <div className="flex flex-col gap-(--space-3)">
    {Array.from({ length: 12 }, (_, index) => (
      <Text key={index} as="p" variant="body">
        A line of content, so the body scrolls and the footer stays pinned.
      </Text>
    ))}
  </div>
);

export const Default: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button onClick={() => setOpen(true)}>Open</Button>
        <ResponsiveSheet
          open={open}
          onOpenChange={setOpen}
          title="Morning run"
          subtitle="7:00–7:40 · Health"
          footer={
            <div className="flex gap-(--space-2)">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          }
        >
          {body}
        </ResponsiveSheet>
      </div>
    );
  },
};

export const Tall: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button onClick={() => setOpen(true)}>Open tall</Button>
        <ResponsiveSheet
          open={open}
          onOpenChange={setOpen}
          size="tall"
          title="Shift the day"
        >
          {body}
        </ResponsiveSheet>
      </div>
    );
  },
};

/**
 * The dirty guard catches every way out — the corner control, Esc, the scrim,
 * and a downward drag. Try all four.
 */
export const DirtyGuard: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [asking, setAsking] = React.useState(false);
    return (
      <div className="p-(--space-6)">
        <Button onClick={() => setOpen(true)}>Open a dirty form</Button>
        <ResponsiveSheet
          open={open}
          onOpenChange={setOpen}
          title="New habit"
          dirty
          onDiscardRequest={() => setAsking(true)}
        >
          <Text as="p" variant="body">
            This sheet is pretending to have unsaved changes.
          </Text>
        </ResponsiveSheet>
        <DiscardDialog
          open={asking}
          onKeepEditing={() => setAsking(false)}
          onDiscard={() => {
            setAsking(false);
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

/**
 * `returnFocusRef` (Workflow, FLO-8): a sheet opened from a menu item has no
 * opener left to return to — the item went with its menu. On close, focus goes
 * to the named control (here *View options*) rather than to the page.
 */
export const ReturnFocus: StoryObj = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLButtonElement>(null);
    return (
      <div className="flex gap-(--space-3) p-(--space-6)">
        <Button ref={menuRef} variant="ghost">
          View options
        </Button>
        <Button onClick={() => setOpen(true)}>Open (focus returns to View options)</Button>
        <ResponsiveSheet open={open} onOpenChange={setOpen} title="Columns" returnFocusRef={menuRef}>
          <Text as="p" variant="body">
            Close this sheet: focus lands on *View options*.
          </Text>
        </ResponsiveSheet>
      </div>
    );
  },
};
