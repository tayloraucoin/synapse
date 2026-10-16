"use client";

import { FiringMark, Text } from "@syn/ui";
import type { FiringPanelView } from "@/lib/data/item-sheet-sessions";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.firing;

/**
 * FiringPanel — a firing item's panel in its sheet (USE-67; while-firing.md,
 * D-USE-44): the mark in its halo, "Firing · 22 min" in the row's firing red
 * (D-USE-51 (3), the named bend of D-USE-38), and under it "Prompt sent at
 * 11:58 · worked 40 min before it". The figures are the derived clock's,
 * read by the caller at its tick; not a live region, so the minutes never
 * announce themselves. Props only.
 */
export interface FiringPanelProps {
  view: FiringPanelView;
}

export function FiringPanel({ view }: FiringPanelProps) {
  return (
    <div className="bg-surface flex items-center gap-(--space-3) rounded-(--radius) px-(--space-4) py-(--space-3)">
      <FiringMark halo />
      <div className="flex min-w-0 flex-col">
        <Text as="span" variant="body" className="text-firing-text">
          {COPY.word(view.firing)}
        </Text>
        <Text as="span" variant="caption" tone="secondary">
          {COPY.line(view.sentAt, view.worked)}
        </Text>
      </div>
    </div>
  );
}
