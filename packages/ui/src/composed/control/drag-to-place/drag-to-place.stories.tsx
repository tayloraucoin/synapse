import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { DragToPlace, useDragSource, useDropTarget } from "./drag-to-place";

/**
 * A pool and two days. The story is the caller: a drop moves the row into
 * the day it was let go over, or back to the pool, and logs the place.
 */

const ITEMS = [
  { id: "ald-17", title: "✍️  [Alder intro]" },
  { id: "kes-58", title: "📤  [Audit log export]" },
];

function Row({ id, title }: { id: string; title: string }) {
  const source = useDragSource(id, title);
  return (
    <div
      ref={source.ref}
      {...source.props}
      className={cn(
        "cursor-grab rounded-(--radius-control) bg-surface px-2 py-1.5 text-(length:--fs-caption) text-ink",
        source.isDragging && "opacity-50",
      )}
    >
      {title}
    </div>
  );
}

function Place({
  id,
  name,
  children,
}: {
  id: string;
  name: string;
  children: React.ReactNode;
}) {
  const target = useDropTarget(id);
  return (
    <div
      ref={target.ref}
      aria-label={name}
      className={cn(
        "flex min-h-32 w-40 flex-col gap-1 border-s border-hairline p-2",
        target.isOver && "bg-surface",
      )}
    >
      <Text as="span" variant="caption" tone="muted">
        {name}
      </Text>
      {children}
    </div>
  );
}

function Playground() {
  const [where, setWhere] = React.useState<Record<string, string>>({
    "ald-17": "pool",
    "kes-58": "pool",
  });
  const [log, setLog] = React.useState<string[]>([]);
  const rows = (place: string) =>
    ITEMS.filter((item) => where[item.id] === place).map((item) => (
      <Row key={item.id} {...item} />
    ));
  return (
    <DragToPlace
      onPlace={(source, target) => {
        setWhere((current) => ({ ...current, [source]: target }));
        setLog((entries) => [...entries, `${source} → ${target}`]);
      }}
    >
      <div className="flex gap-(--space-6)">
        <Place id="pool" name="Pool">
          {rows("pool")}
        </Place>
        <Place id="mon" name="Monday · Primary">
          {rows("mon")}
        </Place>
        <Place id="tue" name="Tuesday · Primary">
          {rows("tue")}
        </Place>
        <ol className="flex flex-col gap-1 font-mono text-(length:--fs-caption)">
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ol>
      </div>
    </DragToPlace>
  );
}

const meta: Meta<typeof Playground> = {
  title: "Composed/Control/DragToPlace",
  component: Playground,
};

export default meta;

type Story = StoryObj<typeof Playground>;

/** Drag a row 6px to lift it; the place under the pointer shades; let go to place it. */
export const Idle: Story = {};
