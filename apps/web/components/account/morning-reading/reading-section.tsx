"use client";

/**
 * ReadingSection — one of Settings › Morning reading's two sections
 * (USE-151; D-USE-122): the heading (17), its muted line (13), the active
 * rows through `SortableList` in Orient's order, "+ Add …" and "Off ›" at
 * the foot.
 *
 * Empty (empty.md): the empty line takes the order line's place, then the
 * add row; no Off. The rows' actions are USE-152's: each row's ···
 * (`RowMenu`), the drop's order, `SaveStatus` beside the heading, the Off
 * list (`OffList`) and its `DeleteDialog`, all through `useRowActions`.
 * The add rows open the sheets (USE-153), so `InlineAddRow` is held closed
 * and its open is the caller's `onAdd`.
 *
 * Loading (loading.md): `ReadingSectionSkeleton` draws the heading and its
 * line at once, with skeleton rows where the rows sit.
 */
import * as React from "react";
import {
  InlineAddRow,
  SaveStatusText,
  SkeletonRow,
  SortableList,
  Text,
  type SortableHandleProps,
} from "@syn/ui";
import type { LinkRecord, PassageRecord, ReadingKind } from "@syn/validators";
import { useDataSource } from "@/lib/data/source";
import { DeleteDialog } from "./delete-dialog";
import { OffList } from "./off-list";
import { nameOf } from "./reading-rows";
import { RowMenu } from "./row-actions";
import { titleOf, useRowActions } from "./use-row-actions";

type ReadingRow = PassageRecord | LinkRecord;

function SectionHead({
  id,
  heading,
  line,
  status,
}: {
  id: string;
  heading: string;
  line: string;
  status?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-(--space-1) pb-(--space-2)">
      <div className="flex items-center justify-between gap-(--space-2)">
        <Text as="h2" id={id} variant="row-title" weight={600}>
          {heading}
        </Text>
        {status}
      </div>
      <Text as="p" variant="secondary" tone="muted">
        {line}
      </Text>
    </div>
  );
}

/** What a row draws beyond its own words: its ··· and, mid-drag, the lift. */
export interface ReadingRowExtras {
  menu: React.ReactNode;
  lifted: boolean;
}

export interface ReadingSectionProps<T extends ReadingRow> {
  kind: ReadingKind;
  id: string;
  heading: string;
  /** The order line, or with no rows the empty line. */
  line: string;
  emptyLine: string;
  addLabel: string;
  rows: readonly T[];
  off: readonly T[];
  /** Off opens on load (`off-open:<kind>`), for its capture. */
  offOpen?: boolean;
  /** Offline: grips, ···, add and the Off buttons wait (D-USE-129). */
  waiting: boolean;
  renderRow: (
    row: T,
    handleProps: SortableHandleProps,
    extras: ReadingRowExtras,
  ) => React.ReactNode;
  onAdd: () => void;
  /** USE-153's sheet; unset, the menu has no Edit. */
  onEdit?: (row: T) => void;
}

/** The `reorder` capture: the held row drawn above `beforeId`, lifted. */
function heldOrder<T extends ReadingRow>(
  rows: readonly T[],
  drag: { itemId: string; beforeId: string } | undefined,
): { rows: readonly T[]; liftedId: string | null } {
  const held = drag && rows.find((row) => row.id === drag.itemId);
  if (!drag || !held || !rows.some((row) => row.id === drag.beforeId)) {
    return { rows, liftedId: null };
  }
  const rest = rows.filter((row) => row !== held);
  const at = rest.findIndex((row) => row.id === drag.beforeId);
  return {
    rows: [...rest.slice(0, at), held, ...rest.slice(at)],
    liftedId: held.id,
  };
}

export function ReadingSection<T extends ReadingRow>({
  kind,
  id,
  heading,
  line,
  emptyLine,
  addLabel,
  rows: stored,
  off,
  offOpen = false,
  waiting,
  renderRow,
  onAdd,
  onEdit,
}: ReadingSectionProps<T>) {
  const actions = useRowActions(kind);
  const drag = useDataSource().scenario.view?.drag;
  const { rows, liftedId } = heldOrder(stored, drag);
  // The list's items carry the name its handle and live region read; the
  // row itself is looked up, so an untitled passage keeps its null title.
  const items = React.useMemo(
    () => rows.map((row) => ({ id: row.id, title: nameOf(row), row })),
    [rows],
  );

  return (
    <section aria-labelledby={id} className="flex flex-col">
      <SectionHead
        id={id}
        heading={heading}
        line={rows.length === 0 ? emptyLine : line}
        status={<SaveStatusText status={actions.status} />}
      />
      {rows.length === 0 ? null : (
        <SortableList
          items={items}
          label={heading}
          disabled={waiting}
          className="gap-0"
          onReorder={actions.reorder}
          renderItem={(item, { handleProps, index }) =>
            renderRow(item.row, handleProps, {
              lifted: item.id === liftedId,
              menu: (
                <RowMenu
                  id={item.id}
                  name={item.title}
                  first={index === 0}
                  last={index === items.length - 1}
                  waiting={waiting}
                  defaultOpen={actions.menuId === item.id}
                  onEdit={onEdit ? () => onEdit(item.row) : undefined}
                  onMove={(direction) => actions.move(item.id, direction)}
                  onTurnOff={() => actions.turnOff(item.row)}
                />
              ),
            })
          }
        />
      )}
      <div role="status" aria-live="polite" className="sr-only">
        {actions.announcement}
      </div>
      <InlineAddRow
        label={addLabel}
        placeholder={addLabel}
        maxLength={0}
        open={false}
        onOpenChange={(next) => {
          if (next) onAdd();
        }}
        onSubmit={() => {}}
        disabled={waiting}
        className="pt-(--space-1)"
      />
      <OffList
        rows={off}
        defaultOpen={offOpen || actions.offOpen}
        waiting={waiting}
        onTurnOn={actions.turnOn}
        onDelete={actions.askDelete}
      />
      <DeleteDialog
        open={actions.deleting !== null}
        title={actions.deleting ? titleOf(actions.deleting) : null}
        onKeep={actions.keep}
        onDelete={actions.confirmDelete}
      />
    </section>
  );
}

/** Loading: the heading and its line at once; skeleton rows, no grips or add rows. */
export function ReadingSectionSkeleton({
  id,
  heading,
  line,
  rows,
}: {
  id: string;
  heading: string;
  line: string;
  rows: number;
}) {
  return (
    <section aria-labelledby={id} aria-busy="true" className="flex flex-col">
      <SectionHead id={id} heading={heading} line={line} />
      <div aria-hidden="true">
        {Array.from({ length: rows }, (_, n) => (
          <SkeletonRow
            key={n}
            leading={false}
            className="border-hairline border-b ps-(--target)"
          />
        ))}
      </div>
    </section>
  );
}
