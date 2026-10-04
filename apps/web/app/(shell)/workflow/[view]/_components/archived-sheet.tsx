"use client";

import * as React from "react";

import { Button, HelperText, ResponsiveSheet, SkeletonRow, StatusLine, Text } from "@syn/ui";
import { formatCalendarDay } from "@syn/utils";

import { trpc } from "@/lib/trpc/client";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";

/**
 * WF-05 — bring something back (Workflow UX v0.1 §4).
 *
 * Two sections under plain headings, each only when it has rows: *Tasks*
 * (the title; *{Group} · archived {date}*, the date the person's short
 * calendar day) and *Groups*. One action per row, *Restore*; it shows
 * *Restored* with no undo — restore is its own inverse: archive again. With
 * neither, *Nothing archived.* Archived views are restored from *New view*.
 * No tally anywhere.
 */
export function ArchivedSheet({
  open,
  onClose,
  returnFocusRef,
  online,
  error,
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  /** *View options* — the item that opened the sheet is gone with its menu. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
  online: boolean;
  error: string | null;
  onRestore: (kind: "task" | "group", id: string) => void;
}) {
  const archived = trpc.workflow.task.listArchived.useQuery(undefined, { enabled: open });
  const data = archived.data;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      title={COPY.archivedSheet}
      returnFocusRef={returnFocusRef}
      footer={
        <div className="flex items-center justify-end">
          <Button onClick={onClose}>{COPY.done}</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-(--space-5)">
        {online ? null : <StatusLine variant="offline" placement="inline" />}
        {error === null ? null : <HelperText error>{error}</HelperText>}

        {data === undefined ? (
          <div className="flex flex-col gap-(--space-2)" aria-hidden="true">
            <SkeletonRow leading={false} />
            <SkeletonRow leading={false} />
          </div>
        ) : data.tasks.length === 0 && data.groups.length === 0 ? (
          <Text as="p" variant="body" tone="secondary">
            {COPY.nothingArchived}
          </Text>
        ) : (
          <>
            {data.tasks.length === 0 ? null : (
              <Section heading={COPY.tasks}>
                {data.tasks.map((task) => (
                  <Row
                    key={task.id}
                    title={task.title}
                    detail={COPY.archivedOn(
                      task.groupName ?? COPY.noGroup,
                      formatCalendarDay(task.archivedAt, data.timeZone, "short"),
                    )}
                    disabled={!online}
                    onRestore={() => onRestore("task", task.id)}
                  />
                ))}
              </Section>
            )}
            {data.groups.length === 0 ? null : (
              <Section heading={COPY.groups}>
                {data.groups.map((group) => (
                  <Row
                    key={group.id}
                    title={group.name}
                    disabled={!online}
                    onRestore={() => onRestore("group", group.id)}
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </ResponsiveSheet>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-(--space-2)">
      <Text as="h3" variant="secondary" weight={500}>
        {heading}
      </Text>
      <ul className="m-0 flex list-none flex-col p-0">{children}</ul>
    </section>
  );
}

function Row({
  title,
  detail,
  disabled,
  onRestore,
}: {
  title: string;
  detail?: string;
  disabled: boolean;
  onRestore: () => void;
}) {
  return (
    <li className="flex min-h-(--row-min) items-center justify-between gap-(--space-3) py-(--space-1)">
      <span className="flex min-w-0 flex-col">
        <Text as="span" variant="body" truncate>
          {title}
        </Text>
        {detail === undefined ? null : (
          <Text as="span" variant="secondary" tone="secondary" truncate>
            {detail}
          </Text>
        )}
      </span>
      <Button variant="ghost" disabled={disabled} onClick={onRestore}>
        {COPY.restore}
      </Button>
    </li>
  );
}
