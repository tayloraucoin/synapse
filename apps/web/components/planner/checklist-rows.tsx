"use client";

import { InlineAddRow, ReorderIcon } from "@syn/ui";
import { PlannerItemRow } from "./planner-item-row";

/**
 * ChecklistRows — a Checklist block on Now (USE-17; now/states/
 * checklist-block.md, sunday-checklist.md): every item a row with a box and
 * a grip (D-USE-17), no card, no lengths, no times, no Start. Checked in any
 * order; a checked row fades in place, keeps no grip and stays live. Nothing
 * lifts. Props only.
 *
 * `add` draws "Add to the checklist": a new row in place, and the field
 * stays open for the next.
 */
export interface ChecklistRowView {
  id: string;
  title: string;
  checked: boolean;
}

export interface ChecklistRowsProps {
  rows: readonly ChecklistRowView[];
  onCheckedChange: (id: string, checked: boolean) => void;
  /** The grip's name: "Reorder Groceries". Dragging is USE-18's. */
  gripLabel: (title: string) => string;
  add?: {
    label: string;
    placeholder: string;
    maxLength: number;
    onAdd: (title: string) => void;
  } | null;
}

export function ChecklistRows({
  rows,
  onCheckedChange,
  gripLabel,
  add = null,
}: ChecklistRowsProps) {
  return (
    <div className="flex flex-col">
      <ul data-checklist-rows="" className="flex flex-col gap-(--space-1)">
        {rows.map((row) => (
          <li key={row.id}>
            <PlannerItemRow
              item={{
                id: row.id,
                title: row.title,
                emoji: null,
                checked: row.checked,
                meta: null,
              }}
              noEmoji
              fadeChecked
              // The row's own tap is the box's: nothing here is made current.
              onOpen={() => onCheckedChange(row.id, !row.checked)}
              onCheckedChange={onCheckedChange}
              trailing={
                row.checked ? null : (
                  <button
                    type="button"
                    aria-label={gripLabel(row.title)}
                    className="text-text-muted flex size-(--target) shrink-0 cursor-grab items-center justify-center rounded-(--radius-control) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <ReorderIcon aria-hidden="true" className="size-4" />
                  </button>
                )
              }
            />
          </li>
        ))}
      </ul>
      {add ? (
        <InlineAddRow
          label={add.label}
          placeholder={add.placeholder}
          maxLength={add.maxLength}
          keepOpen
          onSubmit={add.onAdd}
        />
      ) : null}
    </div>
  );
}
