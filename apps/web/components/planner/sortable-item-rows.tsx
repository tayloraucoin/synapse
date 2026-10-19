"use client";

import type * as React from "react";
import {
  cn,
  ReorderIcon,
  SortableHandle,
  SortableList,
  type SortableHandleProps,
} from "@syn/ui";

/**
 * SortableItemRows — a block's rows in order, each undone row carrying its
 * grip (USE-18; day/now/states/reordering.md, D-USE-17). Over `@syn/ui`'s
 * `SortableList`: only the grip drags, so a long-press on the row's body
 * stays the row's menu. A dragged row lifts on the surface with a 1 px ink
 * edge and no shadow, a 2 px ink drop line above where it lands; under
 * reduced motion it moves without a glide (the list's own). Props only.
 */
export interface SortableItemRow {
  id: string;
  title: string;
}

export interface SortableItemRowsProps<T extends SortableItemRow> {
  items: readonly T[];
  /** The list's name. */
  label: string;
  onReorder: (ids: string[]) => void;
  /** Whether a row has a grip: an undone row, never the lifted card. */
  hasGrip: (item: T) => boolean;
  /**
   * The row; `grip` goes at its end (null for a row without one), `lifted`
   * while it is dragged.
   */
  renderRow: (
    item: T,
    state: { grip: React.ReactNode; lifted: boolean },
  ) => React.ReactNode;
  /** A row drawn mid-drag and held there (`?state=reordering` only). */
  frozenId?: string | null;
}

function Grip({ handleProps }: { handleProps: SortableHandleProps }) {
  return (
    // `data-grip`: the row's long-press leaves the grip to the drag.
    <span data-grip className="flex shrink-0">
      <SortableHandle
        {...handleProps}
        className={cn(
          handleProps.className,
          "text-text-muted rounded-(--radius-control)",
        )}
      >
        <ReorderIcon aria-hidden="true" className="size-4" />
      </SortableHandle>
    </span>
  );
}

export function SortableItemRows<T extends SortableItemRow>({
  items,
  label,
  onReorder,
  hasGrip,
  renderRow,
  frozenId = null,
}: SortableItemRowsProps<T>) {
  return (
    <SortableList
      items={items}
      label={label}
      onReorder={onReorder}
      // The list's own lift is replaced by the row's: surface, ink edge.
      itemClassName="block border-0 data-lifted:opacity-100"
      renderItem={(item, { handleProps, isLifted }) => {
        const lifted = isLifted || item.id === frozenId;
        return (
          <div
            data-lifted-row={lifted || undefined}
            className={cn(
              "relative rounded-(--radius-control) border border-transparent",
              lifted && "border-ink bg-surface",
            )}
          >
            {lifted ? (
              <span
                aria-hidden="true"
                className="bg-ink absolute inset-x-0 -top-1.5 h-0.5"
              />
            ) : null}
            {renderRow(item, {
              grip: hasGrip(item) ? <Grip handleProps={handleProps} /> : null,
              lifted,
            })}
          </div>
        );
      }}
    />
  );
}
