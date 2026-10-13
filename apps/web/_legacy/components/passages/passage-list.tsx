"use client";

import * as React from "react";

import { Button, SkeletonRow, SortableList, StatusLine, Text } from "@syn/ui";
import type { PassageView } from "@syn/types";

import { PASSAGES_COPY as COPY } from "./copy";
import { PassageCard } from "./passage-card";
import { PassageSheet } from "./passage-sheet";
import { usePassages } from "./use-passages";

/**
 * The passage list — UX v1.2 §4.6 (RUN-9): the cards in cycle order, reordered
 * by handle, each with its menu; empty, one muted line left-aligned and *Add a
 * passage* full width (the frame rules, S4.1); with rows, the button beneath.
 * Mounted by screen 6 and by Settings → Your day → Before the day — the same
 * component, so the two cannot drift.
 *
 * An archive leaves an inline undo line for five seconds; a reorder writes
 * at once. The sheet opens on *Add a passage* and on a card's *Edit*, and
 * focus returns to where it left.
 */
export function PassageList({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const passages = usePassages();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PassageView | null>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    onCountChange?.(passages.rows.length);
  }, [passages.rows.length, onCountChange]);

  const openNew = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const items = passages.rows.map((row) => ({
    id: row.id,
    title: row.title ?? COPY.untitled,
    row,
  }));

  const addButton = (
    <Button ref={addRef} variant="secondary" onClick={openNew} className="w-full wide:w-auto wide:self-start">
      {COPY.addAPassage}
    </Button>
  );

  return (
    <div className="flex flex-col gap-(--space-3)">
      {passages.loading ? (
        <SkeletonRow />
      ) : items.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.nothingYet}
        </Text>
      ) : (
        <SortableList
          label={COPY.heading}
          items={items}
          onReorder={(ids) => void passages.onReorder(ids)}
          renderItem={(item, { handleProps, isLifted }) => (
            <PassageCard
              passage={item.row}
              handleProps={handleProps}
              isLifted={isLifted}
              onEdit={() => {
                setEditing(item.row);
                setSheetOpen(true);
              }}
              onArchive={() => void passages.onArchive(item.row)}
            />
          )}
        />
      )}

      {passages.archived === null ? null : (
        <StatusLine
          variant="sync-issues"
          text={COPY.archived}
          placement="inline"
          action={{ label: COPY.undo, onClick: () => void passages.onUndo() }}
        />
      )}

      {addButton}

      <PassageSheet
        open={sheetOpen}
        passage={editing}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) window.setTimeout(() => addRef.current?.focus(), 0);
        }}
      />
    </div>
  );
}
