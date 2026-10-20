"use client";

/**
 * OffList — a section's "Off" (USE-152; list-off-open.md, D-USE-124,
 * D-USE-125). Props only.
 *
 * A disclosure that hides while its list is empty: the muted line, then each
 * off row with "Turn on" and "Delete" in ink, never ···. Turn on puts the row
 * at the end of its active list; Delete opens the confirm. Both are named in
 * full ("Turn on The long view") and wait offline (D-USE-129); "Off" still
 * opens. It is `ArchivedSection`'s collapsible without its counted label, as
 * the screen shows no counts.
 */
import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DisclosureIcon,
  ExpandIcon,
  Text,
  TextDisclosureButton,
} from "@syn/ui";
import type { LinkRecord, PassageRecord } from "@syn/validators";
import { MORNING_READING_COPY as COPY } from "./copy";
import { OffRow } from "./reading-rows";

type ReadingRow = PassageRecord | LinkRecord;

export interface OffListProps<T extends ReadingRow> {
  rows: readonly T[];
  /** Open on load (`off-open:<kind>`, or behind its delete dialog). */
  defaultOpen?: boolean;
  waiting: boolean;
  onTurnOn?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function OffList<T extends ReadingRow>({
  rows,
  defaultOpen = false,
  waiting,
  onTurnOn,
  onDelete,
}: OffListProps<T>) {
  const [open, setOpen] = React.useState(defaultOpen);
  if (rows.length === 0) return null;

  return (
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
          {rows.map((row) => (
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
