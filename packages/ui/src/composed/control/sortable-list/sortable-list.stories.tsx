import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Text } from "../../../primitives/typography/text";
import { EmojiSlot } from "../../display/emoji-slot";
import { SortableHandle, SortableList } from "./sortable-list";

/**
 * Reorder by handle, pointer and keyboard (UX v1.2 §10.2, §10.4). Drag the
 * grip; or focus it and press Alt+↓ — the row moves one step and the live
 * region says where it went. Space lifts for dnd-kit's own keyboard path;
 * touch lifts after 300ms so a scroll that starts on a handle scrolls.
 *
 * The lifted row is 0.9 opacity with a 1.5px accent border — the Schedule's
 * lift grammar, typed here again, not imported.
 */
const meta: Meta<typeof SortableList> = {
  title: "Composed/Control/SortableList",
  component: SortableList,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

type Row = { id: string; title: string; icon: string; detail: string };

const PROMPTS: Row[] = [
  { id: "p1", title: "What went well", icon: "🌱", detail: "prompt" },
  { id: "p2", title: "What I'd do differently", icon: "🔁", detail: "prompt" },
  { id: "p3", title: "One thing I'm grateful for", icon: "🙏", detail: "prompt" },
  { id: "p4", title: "Tomorrow's one thing", icon: "🎯", detail: "prompt" },
];

function Demo({ initial, disabled = false }: { initial: Row[]; disabled?: boolean }) {
  const [rows, setRows] = React.useState(initial);
  const [log, setLog] = React.useState<string[]>([]);
  return (
    <div className="flex flex-col gap-(--space-4)">
      <SortableList
        label="Journal prompts"
        items={rows}
        disabled={disabled}
        onReorder={(ids) => {
          const byId = new Map(rows.map((row) => [row.id, row]));
          setRows(ids.map((id) => byId.get(id)).filter((row): row is Row => row !== undefined));
          setLog((entries) => [...entries, ids.join(" · ")]);
        }}
        renderItem={(row, { handleProps, isLifted }) => (
          <>
            <SortableHandle {...handleProps} />
            <EmojiSlot icon={{ kind: "emoji", value: row.icon }} />
            <Text as="span" variant="row-title" weight={500} truncate className="min-w-0 flex-1">
              {row.title}
            </Text>
            <Text as="span" variant="caption" tone="secondary" className="pe-(--space-2)">
              {isLifted ? "lifted" : row.detail}
            </Text>
          </>
        )}
      />
      <ol className="text-text-secondary m-0 list-decimal ps-(--space-5) text-(length:--fs-caption)">
        {log.map((entry, index) => (
          <li key={index}>onReorder: {entry}</li>
        ))}
      </ol>
    </div>
  );
}

export const Idle: StoryObj = { render: () => <Demo initial={PROMPTS} /> };

/** Press and hold the first grip: the row lifts. */
export const Lifted: StoryObj = { render: () => <Demo initial={PROMPTS} /> };

/** Drop it on the third row: 120ms settle; the log shows the new order. */
export const Dropping: StoryObj = { render: () => <Demo initial={PROMPTS} /> };

/** Tab to the second grip and press Alt+↓: it becomes third and the live region announces. */
export const Keyboard: StoryObj = { render: () => <Demo initial={PROMPTS} /> };

/** Under `prefers-reduced-motion` the rows jump; no transition is set. */
export const ReducedMotion: StoryObj = {
  render: () => <Demo initial={PROMPTS} />,
  parameters: { docs: { description: { story: "Toggle reduced motion in the OS or DevTools." } } },
};

/** One item: the handle is present and inert. */
export const OneItem: StoryObj = { render: () => <Demo initial={PROMPTS.slice(0, 1)} /> };

export const Disabled: StoryObj = { render: () => <Demo initial={PROMPTS} disabled /> };
