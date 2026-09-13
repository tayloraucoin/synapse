import type { DragState } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { BLOCK_MORNING, BLOCK_PREP, BLOCK_WORK, STORY_TIME_ZONE } from "../../__fixtures__/view-models";
import { BlockBand } from "../../display/block-band";
import { GapBand } from "../../display/gap-band";
import { ScheduleAxis } from "../../display/schedule-axis";
import { ScheduleBlock } from "../../display/schedule-block";
import { DragLayer, type DragIntent, type DragLayerBlock, type DragLayerItem } from "./drag-layer";

/**
 * The layer over Taylor's Monday morning. It emits intents; the story is the
 * caller, and logs what it would send to `item.move` / `day.moveBlock`.
 */

const PX_PER_HOUR = 96;
const AXIS_START = 7 * 60;
const AXIS_END = 10 * 60;
const pxOf = (minutes: number) => ((minutes - AXIS_START) / 60) * PX_PER_HOUR;
const minutesOf = (date: Date) => ((date.getUTCHours() - 7 + 24) % 24) * 60 + date.getUTCMinutes();
const formatTime = (minutes: number) =>
  `${Math.floor((minutes % 1440) / 60)}:${String(minutes % 60).padStart(2, "0")}`;

const MORNING_ITEMS: DragLayerItem[] = [...BLOCK_MORNING.items, ...BLOCK_PREP.items, ...BLOCK_WORK.items.slice(1)].map(
  (item) => ({
    id: item.id,
    title: item.title,
    startMin: minutesOf(item.scheduledStart as Date),
    durationMin: item.durationMin ?? 0,
    pinned: item.pinned,
    resizable: !item.pinned,
    blockId: item.dayBlockId,
  }),
);

const BANDS: DragLayerBlock[] = [
  { id: BLOCK_MORNING.id, name: "Morning", startMin: 8 * 60 + 3, endMin: 9 * 60 + 4, draggable: true },
  { id: BLOCK_PREP.id, name: "Before work", startMin: 8 * 60 + 35, endMin: 9 * 60, draggable: false },
];

function Playground({
  state: initialState = "idle",
  moveMode = false,
  editor = false,
  refuseAll = false,
  seams = false,
  askPins = false,
}: {
  state?: DragState;
  moveMode?: boolean;
  editor?: boolean;
  refuseAll?: boolean;
  /** The editor's seams between blocks, and a range on each item (DYN-9). */
  seams?: boolean;
  /** A pin's drag reports its target for the caller's dialog (DYN-16). */
  askPins?: boolean;
}) {
  const [items, setItems] = React.useState<DragLayerItem[]>(() =>
    seams
      ? MORNING_ITEMS.map((item) => ({ ...item, gapBeforeMin: 0, rangeMin: 10, rangeMax: 30 }))
      : MORNING_ITEMS,
  );
  const [state, setState] = React.useState<DragState>(initialState);
  const [log, setLog] = React.useState<string[]>([]);

  const onIntent = (intent: DragIntent) => {
    setLog((entries) => [...entries, JSON.stringify(intent)]);
    if (refuseAll) {
      setState("refused");
      window.setTimeout(() => setState("idle"), 1500);
      return;
    }
    setState("dropping");
    window.setTimeout(() => setState("idle"), 120);
    if (intent.kind === "move") {
      setItems((current) =>
        current.map((item) => (item.id === intent.id ? { ...item, startMin: intent.toMin } : item)),
      );
    }
    if (intent.kind === "resize") {
      setItems((current) =>
        current.map((item) => (item.id === intent.id ? { ...item, durationMin: intent.durationMin } : item)),
      );
    }
    if (intent.kind === "move-block") {
      setItems((current) =>
        current.map((item) =>
          item.blockId === intent.blockId && !item.pinned
            ? { ...item, startMin: item.startMin + intent.deltaMin }
            : item,
        ),
      );
    }
    if (intent.kind === "gap") {
      // The story re-flows the one item; the editor's walk does the rest.
      setItems((current) =>
        current.map((item) =>
          item.id === intent.id
            ? { ...item, startMin: item.startMin + (intent.minutes - (item.gapBeforeMin ?? 0)), gapBeforeMin: intent.minutes }
            : item,
        ),
      );
    }
  };

  // The seams: one above every non-pinned item after the first in its block.
  const ordered = [...items].sort((a, b) => a.startMin - b.startMin);
  const seamRows = seams
    ? ordered.flatMap((item, index) => {
        const before = ordered[index - 1];
        if (!before || item.pinned || before.blockId !== item.blockId) return [];
        return [{ afterId: item.id, before: before.title, after: item.title, startMin: before.startMin + before.durationMin, minutes: item.gapBeforeMin ?? 0 }];
      })
    : [];

  const viewOf = (item: DragLayerItem) => {
    const source = [...BLOCK_MORNING.items, ...BLOCK_PREP.items, ...BLOCK_WORK.items].find((v) => v.id === item.id);
    if (!source) throw new Error(item.id);
    const start = new Date(Date.UTC(2026, 8, 4, 7 + Math.floor(item.startMin / 60), item.startMin % 60));
    return {
      ...source,
      scheduledStart: start,
      scheduledEnd: new Date(start.getTime() + item.durationMin * 60_000),
      durationMin: item.durationMin,
    };
  };

  return (
    <div className="flex gap-(--space-6)">
      <DragLayer
        pxPerHour={PX_PER_HOUR}
        axisStartMin={AXIS_START}
        items={items}
        blocks={BANDS}
        state={state}
        refusedMessage="Fixed things don't move by drag."
        onIntent={onIntent}
        onLift={() => setState("lifted")}
        onCancel={() => setState("idle")}
        onPinnedDrop={
          askPins
            ? (id, toMin) => {
                setLog((entries) => [...entries, `ask: move ${id} to ${formatTime(toMin)}?`]);
                setState("confirming");
                window.setTimeout(() => setState("idle"), 1500);
              }
            : undefined
        }
        moveMode={moveMode}
        editor={editor}
        formatTime={formatTime}
        className="w-80"
      >
        <ScheduleAxis startMin={AXIS_START} endMin={AXIS_END} pxPerHour={PX_PER_HOUR} timeZone={STORY_TIME_ZONE} className="h-[320px]">
          {BANDS.map((band) => (
            <BlockBand
              key={band.id}
              blockId={band.id}
              kind={band.id === BLOCK_PREP.id ? "prep" : "morning"}
              name={band.name}
              topPx={pxOf(band.startMin)}
              heightPx={pxOf(band.endMin) - pxOf(band.startMin)}
              draggable={band.draggable}
            />
          ))}
          {seamRows.map((seam) => (
            <GapBand
              key={seam.afterId}
              minutes={seam.minutes}
              topPx={pxOf(seam.startMin)}
              heightPx={(seam.minutes / 60) * PX_PER_HOUR}
              between={{ before: seam.before, after: seam.after }}
              resizable
              afterId={seam.afterId}
            />
          ))}
          {items.map((item) => (
            <ScheduleBlock
              key={item.id}
              item={viewOf(item)}
              topPx={pxOf(item.startMin)}
              heightPx={(item.durationMin / 60) * PX_PER_HOUR}
              draggable={!item.pinned}
              resizable={item.resizable}
              pinned={item.pinned}
              timeZone={STORY_TIME_ZONE}
              onOpen={() => {}}
              className="z-10"
            />
          ))}
        </ScheduleAxis>
      </DragLayer>

      <div className="flex w-72 flex-col gap-(--space-2)">
        <Text as="span" variant="caption" tone="secondary">
          state: {state}
        </Text>
        <Text as="span" variant="caption" tone="secondary">
          intents
        </Text>
        <ol className="flex flex-col gap-(--space-1) font-mono text-(length:--fs-caption)">
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

const meta: Meta<typeof Playground> = {
  title: "Composed/Control/DragLayer",
  component: Playground,
};

export default meta;

type Story = StoryObj<typeof Playground>;

/** Long-press (300 ms) or mouse-drag a block; it snaps to five and the displaced re-stack beneath. */
export const Idle: Story = {};

/** Every drop refused: the block returns, the line shows and is announced (§6.5 *refused*). */
export const Refused: Story = { args: { refuseAll: true } };

/** The caller is asking about a pin; the layer holds still (§6.5 *confirming*). */
export const Confirming: Story = { args: { state: "confirming" } };

/** Move mode (§10.4): one tap lifts, the next tap drops — no long-press. */
export const MoveMode: Story = { args: { moveMode: true } };

/** The block editor: Alt+↑/↓ reorders rather than moves in time (§3.11). */
export const EditorReorder: Story = { args: { editor: true } };

/**
 * The editor's gaps (§3.11, DYN-9): drag a seam between two blocks to open
 * the gap before the lower one; `g` then a number on a focused block does
 * the same; a resize draws the range as a faint band and clamps to nothing.
 */
export const EditorSeams: Story = { args: { editor: true, seams: true } };

/** A pin dragged (§6.5, R22): no lift, no ghost; the release asks the caller (DYN-16). */
export const PinAsks: Story = { args: { askPins: true } };

/**
 * By keyboard alone (§10.4): Tab to a block, then Alt+↓ twice, Shift+↑ once,
 * `m` and a time. The button dispatches the same key events for a reviewer
 * who wants to watch the log and the live region fill without typing.
 */
export const Keyboard: StoryObj = {
  render: () => {
    const run = () => {
      const block = document.querySelector<HTMLElement>('[data-item-id="meditate"]');
      if (!block) return;
      block.focus();
      const press = (init: KeyboardEventInit) =>
        block.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
      // A frame apart, as real presses are: each reads the re-rendered geometry.
      press({ key: "ArrowDown", altKey: true });
      window.setTimeout(() => press({ key: "ArrowDown", altKey: true }), 50);
      window.setTimeout(() => press({ key: "ArrowUp", shiftKey: true }), 100);
    };
    return (
      <div className="flex flex-col gap-(--space-4)">
        <Button variant="secondary" size="sm" onClick={run} className="w-fit">
          Run: Alt+↓, Alt+↓, Shift+↑ on Meditate
        </Button>
        <Playground />
      </div>
    );
  },
};

/** Reduced motion: no scale on the lifted ghost, positions jump (§10.4). Toggle it in the OS or DevTools. */
export const ReducedMotion: Story = {
  parameters: { docs: { description: { story: "Emulate prefers-reduced-motion: reduce and lift a block." } } },
};
