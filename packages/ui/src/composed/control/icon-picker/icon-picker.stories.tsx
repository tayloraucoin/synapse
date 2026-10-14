import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { IconValue } from "@syn/types";
import type { SavedColour } from "./icon-colour-rows";
import { IconPicker, type IconPickerInitial } from "./icon-picker";

/**
 * The icon picker (USE-11): a step inside the sheet that opens it, two tabs
 * of one height, every emoji and every Lucide icon. One story per drawn
 * state. Suggestions here are a stand-in: the app passes `suggestIcons`.
 */
const meta: Meta<typeof IconPicker> = {
  title: "Composed/Control/IconPicker",
  component: IconPicker,
  decorators: [
    (Story) => (
      <div className="bg-paper flex h-[760px] max-w-[402px] flex-col p-(--space-4)">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const SAVED: SavedColour[] = [
  { id: "a", hex: "#2f6f62" },
  { id: "b", hex: "#6a4c93" },
  { id: "c", hex: "#d4893a" },
  { id: "d", hex: "#3d5a80" },
];

const RECENT = {
  emoji: ["💧", "🛁", "⚖️", "🏋️", "🚗", "🍳", "🔄", "📞"],
  icon: [],
};

function wordsMatch(name: string) {
  const words = name
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);
  return (entries: readonly { id: string; keywords: readonly string[] }[]) =>
    entries
      .filter((entry) =>
        entry.keywords.some((k) =>
          words.some((w) => k.toLowerCase().startsWith(w.slice(0, 5))),
        ),
      )
      .slice(0, 5)
      .map((entry) => entry.id);
}

function Picker({
  name = "Meditate",
  initial,
  start,
}: {
  name?: string;
  initial?: IconPickerInitial;
  start?: IconValue;
}) {
  const [value, setValue] = React.useState<IconValue | null>(
    start ?? { kind: "emoji", value: "🧘" },
  );
  const [saved, setSaved] = React.useState(SAVED);
  return (
    <IconPicker
      name={name}
      value={value}
      backLabel={name || "Add to Wellness"}
      onBack={() => {}}
      onPick={setValue}
      suggest={wordsMatch(name)}
      recent={RECENT}
      savedColours={saved}
      onSaveColour={(hex) => setSaved((list) => [{ id: hex, hex }, ...list])}
      onUpdateColour={(id, hex) =>
        setSaved((list) => list.map((s) => (s.id === id ? { ...s, hex } : s)))
      }
      onRemoveColour={(id) =>
        setSaved((list) => list.filter((s) => s.id !== id))
      }
      initial={initial}
    />
  );
}

const LEAF: IconValue = { kind: "lucide", value: "leaf", color: "#2f6f62" };

export const EmojiSuggested: StoryObj = { render: () => <Picker /> };
export const NoNameYet: StoryObj = { render: () => <Picker name="" /> };
export const IconTab: StoryObj = {
  render: () => <Picker start={LEAF} initial={{ tab: "icon" }} />,
};
export const CustomColour: StoryObj = {
  render: () => (
    <Picker start={LEAF} initial={{ tab: "icon", panel: { kind: "custom" } }} />
  ),
};
export const BadHex: StoryObj = {
  render: () => (
    <Picker
      start={LEAF}
      initial={{ tab: "icon", panel: { kind: "custom" }, hexText: "2F6G6" }}
    />
  ),
};
export const SavedColours: StoryObj = {
  render: () => (
    <Picker
      start={LEAF}
      initial={{ tab: "icon", editing: true, panel: { kind: "edit", id: "a" } }}
    />
  ),
};
