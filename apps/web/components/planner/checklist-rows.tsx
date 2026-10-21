"use client";

import type * as React from "react";
import { InlineAddRow } from "@syn/ui";
import { PlannerItemRow } from "./planner-item-row";
import { SortableItemRows } from "./sortable-item-rows";

/**
 * ChecklistRows — a Checklist block on Now (USE-17; now/states/
 * checklist-block.md, sunday-checklist.md): every item a row with a box and
 * a grip (D-USE-17), no card, no lengths, no times, no Start. Checked in any
 * order; a checked row fades in place, keeps no grip and stays live. Nothing
 * lifts. Props only.
 *
 * The grip drags (USE-18's `SortableItemRows`): on a phone a press on the
 * grip lifts the row, and the row's words stay selectable elsewhere.
 * `below` draws a row's own line (a check that did not save); `notice` the
 * list's (an add or an order that did not save).
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
  /** The list's name, for the drag's announcements. */
  label: string;
  /** The new order, every id, after a drop. */
  onReorder: (ids: string[]) => void;
  below?: (id: string) => React.ReactNode;
  notice?: React.ReactNode;
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
  label,
  onReorder,
  below,
  notice = null,
  add = null,
}: ChecklistRowsProps) {
  return (
    <div data-checklist-rows="" className="flex flex-col">
      <SortableItemRows
        items={rows}
        label={label}
        onReorder={onReorder}
        hasGrip={(row) => !row.checked}
        renderRow={(row, { grip }) => (
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
            trailing={grip}
            below={below?.(row.id)}
          />
        )}
      />
      {notice}
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
