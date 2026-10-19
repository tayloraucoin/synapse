"use client";

import * as React from "react";
import {
  AddIcon,
  cn,
  CompleteBlockIcon,
  DeleteIcon,
  FromPoolIcon,
  ItemIcon,
  MoveToIcon,
  NotTodayIcon,
  OpenInLinearIcon,
  Text,
  UnlinkIcon,
} from "@syn/ui";
import { shortDay } from "@/components/work/add/new-task/form";
import type { WorkSheetView } from "@/lib/data/item-sheet-work";
import { NowBlockMenu, type NowBlockMenuRow } from "../now-block-menu";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.work;
const LINEAR = ITEM_SHEET_COPY.linear;

/**
 * A work item's ··· (USE-65; item-sheet/states/work-more-open.md, D-USE-57):
 * Mark the task done with the sessions and issue it closes, Back to the
 * pool, Spread across the week, Open in Linear (a linked item only), Remove
 * from Synapse with "The Linear issue stays as it is". Nothing in red: the
 * consequence line carries the weight.
 *
 * The rows are made once. On the phone they are `WorkMoreList`, the sheet's
 * own step as the action sheet draws it (the heading line, then the rows on
 * hairlines), so a second sheet never stacks; at the desk `WorkMoreMenu`,
 * the same rows as a pull-down from ··· (D-USE-103).
 */
export interface WorkMoreActions {
  onMarkDone: () => void;
  onBackToPool: () => void;
  /** Spread (USE-78); absent, the row waits for it. */
  onSpread?: () => void;
  onOpenInLinear: () => void;
  onRemove: () => void;
  /** A linked item's Unlink from Linear (USE-66). */
  onUnlink?: () => void;
  /** Before the day begins, a linked item's Move to… and Not today (USE-66). */
  onMoveTo?: () => void;
  onNotToday?: () => void;
}

/** Unlink, after a rule, with its consequence (linear-more-open.md). */
function unlinkRow(actions: WorkMoreActions): NowBlockMenuRow | null {
  if (actions.onUnlink === undefined) return null;
  return {
    label: LINEAR.menu.unlink,
    icon: UnlinkIcon,
    onSelect: actions.onUnlink,
    detail: LINEAR.menu.unlinkLine,
    separated: true,
  };
}

export function workMoreRows(
  view: WorkSheetView,
  actions: WorkMoreActions,
): NowBlockMenuRow[] {
  const { item, otherSessions } = view;
  // A linked item before the day begins (linear-more-open.md): Move to…,
  // Not today, then Unlink; no Monday's usual on a work item.
  if (item.linked && !view.ready && actions.onUnlink !== undefined) {
    return [
      {
        label: ITEM_SHEET_COPY.menu.moveTo,
        icon: MoveToIcon,
        onSelect: () => actions.onMoveTo?.(),
      },
      ...(view.slot?.today
        ? [
            {
              label: ITEM_SHEET_COPY.menu.notToday,
              icon: NotTodayIcon,
              onSelect: () => actions.onNotToday?.(),
            },
          ]
        : []),
      unlinkRow(actions)!,
    ];
  }
  const days = otherSessions.map(shortDay);
  const doneLine = COPY.menu.markDoneLine(days, item.linked);
  const rows: (NowBlockMenuRow | null)[] = [
    {
      label: COPY.menu.markDone,
      icon: CompleteBlockIcon,
      onSelect: actions.onMarkDone,
      ...(doneLine === null ? {} : { detail: doneLine }),
    },
    {
      label: COPY.menu.backToPool,
      icon: FromPoolIcon,
      onSelect: actions.onBackToPool,
    },
    {
      label: COPY.menu.spread,
      icon: AddIcon,
      onSelect: () => actions.onSpread?.(),
    },
    item.url === null
      ? null
      : {
          label: COPY.menu.openInLinear,
          icon: OpenInLinearIcon,
          onSelect: actions.onOpenInLinear,
        },
    {
      label: COPY.menu.remove,
      icon: DeleteIcon,
      onSelect: actions.onRemove,
      ...(item.linked ? { detail: COPY.menu.removeLine } : {}),
    },
    // [ASSUMPTION] Once the day has begun, Unlink follows the work menu's rows.
    item.linked ? unlinkRow(actions) : null,
  ];
  return rows.filter((row) => row !== null);
}

/** The heading line: the icon, the name, "· session 1 of 3"; before the day, "<name>, today only". */
function headingWords(view: WorkSheetView): string {
  const { session, item } = view;
  if (item.linked && !view.ready) return ITEM_SHEET_COPY.menu.title(item.title);
  return session === null
    ? item.title
    : `${item.title} · ${COPY.session(session.n, session.of)}`;
}

export function WorkMoreMenu({
  view,
  rows,
  defaultOpen,
}: {
  view: WorkSheetView;
  rows: readonly NowBlockMenuRow[];
  defaultOpen: boolean;
}) {
  return (
    <NowBlockMenu
      label={COPY.more(view.item.title)}
      title={headingWords(view)}
      rows={rows}
      defaultOpen={defaultOpen}
    />
  );
}

export function WorkMoreList({
  view,
  rows,
  headingRef,
}: {
  view: WorkSheetView;
  rows: readonly NowBlockMenuRow[];
  headingRef: React.Ref<HTMLHeadingElement>;
}) {
  const headingId = React.useId();
  return (
    <div className="flex flex-col">
      <Text
        ref={headingRef}
        as="h2"
        id={headingId}
        variant="secondary"
        tone="secondary"
        tabIndex={-1}
        className="flex items-center gap-(--space-2) pb-(--space-2) outline-none"
      >
        <ItemIcon icon={view.item.icon} size={20} />
        {headingWords(view)}
      </Text>
      <ul
        aria-labelledby={headingId}
        className="divide-hairline flex flex-col divide-y"
      >
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li key={row.label}>
              <button
                type="button"
                onClick={row.onSelect}
                className={cn(
                  "flex min-h-14 w-full items-start gap-(--space-3) py-(--space-3) text-start",
                  "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className="text-foreground mt-0.5 size-4 shrink-0"
                />
                <span className="flex flex-col gap-(--space-1)">
                  <Text as="span" variant="body">
                    {row.label}
                  </Text>
                  {row.detail === undefined ? null : (
                    <Text as="span" variant="caption" tone="secondary">
                      {row.detail}
                    </Text>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
