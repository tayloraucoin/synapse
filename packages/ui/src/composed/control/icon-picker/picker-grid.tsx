/**
 * PickerGrid — the icon picker's scrolling list, virtualised by hand (no new
 * dependency): headings, rows of eight cells, muted notes and hairlines, each
 * a fixed height, so a row's offset is a sum and only the rows in view (and a
 * few either side) are in the DOM. Nearly two thousand emoji or Lucide icons
 * cost what a screenful costs.
 *
 * `GroupBar` is the pinned bar at the foot that jumps between groups; the
 * group in view is marked as the current one.
 */
"use client";

import * as React from "react";
import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import type { PickerEntry } from "./icon-sets";

export type GridRow =
  | { kind: "heading"; key: string; text: string; section?: string }
  | { kind: "cells"; key: string; cells: readonly PickerEntry[] }
  | { kind: "note"; key: string; text: string }
  | { kind: "rule"; key: string };

const HEIGHT: Record<GridRow["kind"], number> = {
  heading: 36,
  cells: 48,
  note: 28,
  rule: 17,
};
export const COLUMNS = 8;
const OVERSCAN = 4;
/** Before the viewport is measured: enough rows for a phone's first paint. */
const FIRST_PAINT_HEIGHT = 800;

/** A group's entries as rows of eight. */
export function cellRows(
  key: string,
  entries: readonly PickerEntry[],
): GridRow[] {
  const rows: GridRow[] = [];
  for (let i = 0; i < entries.length; i += COLUMNS) {
    rows.push({
      kind: "cells",
      key: `${key}-${i / COLUMNS}`,
      cells: entries.slice(i, i + COLUMNS),
    });
  }
  return rows;
}

export interface PickerGridHandle {
  scrollToSection: (section: string) => void;
}

export interface PickerGridProps {
  rows: readonly GridRow[];
  renderCell: (entry: PickerEntry) => React.ReactNode;
  /** The section whose heading is at or above the top of the view. */
  onSectionChange?: (section: string | null) => void;
  label: string;
  className?: string;
}

export const PickerGrid = React.forwardRef<PickerGridHandle, PickerGridProps>(
  function PickerGrid(
    { rows, renderCell, onSectionChange, label, className },
    ref,
  ) {
    const scroller = React.useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = React.useState(0);
    const [height, setHeight] = React.useState(FIRST_PAINT_HEIGHT);

    const offsets = React.useMemo(() => {
      const tops: number[] = [];
      let y = 0;
      for (const row of rows) {
        tops.push(y);
        y += HEIGHT[row.kind];
      }
      return { tops, total: y };
    }, [rows]);

    const sections = React.useMemo(
      () =>
        rows.flatMap((row, i) =>
          row.kind === "heading" && row.section
            ? [{ id: row.section, top: offsets.tops[i]! }]
            : [],
        ),
      [rows, offsets],
    );

    React.useImperativeHandle(ref, () => ({
      scrollToSection(section) {
        const found = sections.find((s) => s.id === section);
        if (found && scroller.current) scroller.current.scrollTop = found.top;
      },
    }));

    React.useEffect(() => {
      const node = scroller.current;
      if (!node) return;
      const observer = new ResizeObserver(() => setHeight(node.clientHeight));
      observer.observe(node);
      setHeight(node.clientHeight);
      return () => observer.disconnect();
    }, []);

    // A new list (a search, the other tab) starts at its top.
    React.useEffect(() => {
      if (scroller.current) scroller.current.scrollTop = 0;
      setScrollTop(0);
    }, [rows]);

    const current = React.useMemo(() => {
      let found: string | null = null;
      for (const section of sections) {
        if (section.top <= scrollTop + 1) found = section.id;
        else break;
      }
      return found;
    }, [sections, scrollTop]);

    React.useEffect(() => {
      onSectionChange?.(current);
    }, [current, onSectionChange]);

    // The first and last rows in view, by binary search on the offsets.
    const first = Math.max(
      0,
      lastAtOrBefore(offsets.tops, scrollTop) - OVERSCAN,
    );
    const last = Math.min(
      rows.length - 1,
      lastAtOrBefore(offsets.tops, scrollTop + height) + OVERSCAN,
    );

    const visible: React.ReactNode[] = [];
    for (let i = first; i <= last; i += 1) {
      const row = rows[i]!;
      visible.push(
        <div
          key={row.key}
          className="absolute inset-x-0"
          style={{ top: offsets.tops[i], height: HEIGHT[row.kind] }}
        >
          <Row row={row} renderCell={renderCell} />
        </div>,
      );
    }

    return (
      <div
        ref={scroller}
        role="group"
        aria-label={label}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        className={cn(
          "relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto",
          className,
        )}
      >
        <div className="relative" style={{ height: offsets.total }}>
          {visible}
        </div>
      </div>
    );
  },
);

function lastAtOrBefore(tops: readonly number[], y: number): number {
  let lo = 0;
  let hi = tops.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (tops[mid]! <= y) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function Row({
  row,
  renderCell,
}: {
  row: GridRow;
  renderCell: (entry: PickerEntry) => React.ReactNode;
}) {
  switch (row.kind) {
    case "heading":
      return (
        <Text
          as="h3"
          variant="secondary"
          weight={600}
          className="flex h-full items-end pb-(--space-2)"
        >
          {row.text}
        </Text>
      );
    case "note":
      return (
        <Text as="p" variant="caption" tone="muted" className="pt-(--space-1)">
          {row.text}
        </Text>
      );
    case "rule":
      return <hr className="border-hairline mt-(--space-2) border-t" />;
    case "cells":
      return (
        <div className="grid grid-cols-8 justify-items-center">
          {row.cells.map((entry) => (
            <React.Fragment key={entry.id}>{renderCell(entry)}</React.Fragment>
          ))}
        </div>
      );
  }
}

export interface GroupBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export function GroupBar({
  items,
  current,
  onJump,
}: {
  items: readonly GroupBarItem[];
  current: string | null;
  onJump: (id: string) => void;
}) {
  return (
    <nav
      aria-label="Groups"
      className="border-hairline -mx-(--space-4) flex shrink-0 overflow-x-auto border-t px-(--space-2) py-(--space-1) [scrollbar-width:none]"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.label}
          title={item.label}
          aria-current={item.id === current ? "true" : undefined}
          onClick={() => onJump(item.id)}
          className={cn(
            "text-ink flex size-(--target) shrink-0 items-center justify-center rounded-(--radius)",
            "transition-colors duration-(--dur-state) ease-(--ease-settle)",
            "hover:bg-surface",
            item.id === current && "bg-surface",
          )}
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}
