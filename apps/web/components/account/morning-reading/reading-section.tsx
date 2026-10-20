"use client";

/**
 * ReadingSection — one of Settings › Morning reading's two sections
 * (USE-151; D-USE-122): the heading (17), its muted line (13), the active
 * rows through `SortableList` in Orient's order, "+ Add …" and "Off ›" at
 * the foot. Props only.
 *
 * Empty (empty.md): the empty line takes the order line's place, then the
 * add row; no Off. "Off" is a disclosure that hides while its list is empty
 * (list-off-open.md); it is `ArchivedSection`'s collapsible without its
 * counted label, as the screen shows no counts. The add rows open the
 * sheets (USE-153), so `InlineAddRow` is held closed and its open is the
 * caller's `onAdd`.
 *
 * Loading (loading.md): `ReadingSectionSkeleton` draws the heading and its
 * line at once, with skeleton rows where the rows sit.
 */
import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DisclosureIcon,
  ExpandIcon,
  InlineAddRow,
  SkeletonRow,
  SortableList,
  Text,
  TextDisclosureButton,
  type SortableHandleProps,
} from "@syn/ui";
import type { LinkRecord, PassageRecord } from "@syn/validators";
import { MORNING_READING_COPY as COPY } from "./copy";
import { nameOf, OffRow } from "./reading-rows";

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

export interface ReadingSectionProps<T extends ReadingRow> {
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
  /** `SaveStatus` beside the heading after a drop or a move (USE-152). */
  status?: React.ReactNode;
  renderRow: (row: T, handleProps: SortableHandleProps) => React.ReactNode;
  /** A drop or Alt+arrow's whole order (USE-152). */
  onReorder?: (ids: string[]) => void;
  onAdd: () => void;
  onTurnOn?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function ReadingSection<T extends ReadingRow>({
  id,
  heading,
  line,
  emptyLine,
  addLabel,
  rows,
  off,
  offOpen = false,
  waiting,
  status,
  renderRow,
  onReorder,
  onAdd,
  onTurnOn,
  onDelete,
}: ReadingSectionProps<T>) {
  const [open, setOpen] = React.useState(offOpen);
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
        status={status}
      />
      {rows.length === 0 ? null : (
        <SortableList
          items={items}
          label={heading}
          disabled={waiting}
          className="gap-0"
          onReorder={(ids) => onReorder?.(ids)}
          renderItem={(item, { handleProps }) =>
            renderRow(item.row, handleProps)
          }
        />
      )}
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
      {off.length === 0 ? null : (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <TextDisclosureButton
              expanded={open}
              collapsedLabel={<OffLabel open={false} />}
              expandedLabel={<OffLabel open />}
              classes={{ root: "text-muted-foreground font-normal" }}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Text
              as="p"
              variant="secondary"
              tone="muted"
              className="border-hairline border-b pb-(--space-2)"
            >
              {COPY.offLine}
            </Text>
            <ul className="m-0 flex list-none flex-col p-0">
              {off.map((row) => (
                <OffRow
                  key={row.id}
                  row={row}
                  waiting={waiting}
                  onTurnOn={onTurnOn ? () => onTurnOn(row) : undefined}
                  onDelete={onDelete ? () => onDelete(row) : undefined}
                />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </section>
  );
}

/** "Off ›" closed, "Off ⌄" open: the word carries it, the chevron follows. */
function OffLabel({ open }: { open: boolean }) {
  const Icon = open ? ExpandIcon : DisclosureIcon;
  return (
    <span className="inline-flex items-center gap-(--space-1)">
      {COPY.off}
      <Icon aria-hidden="true" className="size-4" />
    </span>
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
