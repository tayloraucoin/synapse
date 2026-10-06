import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Input } from "../../../primitives/control/input";
import { EmojiSlotButton } from "./emoji-slot-button";

/**
 * The glyph in a field's leading slot, and the picker behind it (UX v1.2
 * §4.3, §4.4). Tap the square: the emoji picker opens; a pick lands in the
 * slot and closes it. Empty until something fills it — a kind chip on the
 * screen, or the person.
 */
const meta: Meta<typeof EmojiSlotButton> = {
  title: "Composed/Control/EmojiSlotButton",
  component: EmojiSlotButton,
  decorators: [(Story) => <div className="max-w-sm p-(--space-6)"><Story /></div>],
};

export default meta;

export const Empty: StoryObj = {
  render: function Render() {
    const [icon, setIcon] = React.useState<{ kind: "emoji"; value: string } | null>(null);
    return <EmojiSlotButton icon={icon} onChange={(next) => next.kind === "emoji" && setIcon(next)} label="Choose an icon" />;
  },
};

export const Filled: StoryObj = {
  render: function Render() {
    const [icon, setIcon] = React.useState<{ kind: "emoji"; value: string } | null>({ kind: "emoji", value: "🏠" });
    return <EmojiSlotButton icon={icon} onChange={(next) => next.kind === "emoji" && setIcon(next)} label="Choose an icon" />;
  },
};

/** Beside a name field, as the type card and the fixture sheet mount it. */
export const BesideAField: StoryObj = {
  render: function Render() {
    const [icon, setIcon] = React.useState<{ kind: "emoji"; value: string } | null>({ kind: "emoji", value: "🗣️" });
    const [name, setName] = React.useState("Stand-up");
    return (
      <div className="flex items-end gap-(--space-2)">
        <EmojiSlotButton icon={icon} onChange={(next) => next.kind === "emoji" && setIcon(next)} label="Choose an icon" className="mb-px" />
        <Input label="What is it" value={name} onChange={(event) => setName(event.target.value)} className="flex-1" />
      </div>
    );
  },
};

export const Disabled: StoryObj = {
  args: { icon: { kind: "emoji", value: "🏠" }, onChange: () => {}, label: "Choose an icon", disabled: true },
};
