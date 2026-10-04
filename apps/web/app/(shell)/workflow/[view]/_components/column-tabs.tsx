"use client";

import type { WorkflowColumnView } from "@syn/types";
import { Tabs, TabsList, TabsTrigger } from "@syn/ui";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";

/**
 * Compact's column tabs (UX WF-01 *Compact*): the view's columns as a second,
 * scrolling row of tabs; one column shows at a time. The choice is `?col=` —
 * state, not navigation — REPLACED on a change, so back leaves the board
 * rather than walking back through columns. The chosen column's name is also
 * the heading over the cells beneath (`Board` draws it).
 */
export function ColumnTabs({
  columns,
  shownId,
  onChange,
}: {
  columns: readonly WorkflowColumnView[];
  shownId: string | undefined;
  onChange: (columnId: string) => void;
}) {
  if (columns.length < 2 || shownId === undefined) return null;
  return (
    <div className="min-w-0 overflow-x-auto pb-(--space-2)">
      <Tabs value={shownId} onValueChange={onChange}>
        {/* [COPY — needs Vesper sign-off: the column tabs' accessible name; §7 has none, *Columns* is its word for them.] */}
        <TabsList variant="line" aria-label={COPY.columns} className="justify-start">
          {columns.map((column) => (
            <TabsTrigger key={column.id} value={column.id} className="flex-none">
              {column.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
