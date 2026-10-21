"use client";

import * as React from "react";
import { Breadcrumb, cn, Skeleton, Text } from "@syn/ui";
import { HUE_DOT, type BlockHue } from "../block-hue";
import {
  BlockViewColumn,
  type BlockViewColumnProps,
  type BlockViewRowModel,
} from "./block-view-column";

/**
 * BlockView — one block as a child page (USE-48; block-view/index.md): its
 * span stretched to fill the screen, back by the breadcrumb. One surface,
 * two modes:
 *
 * - `"day"` (this ticket, `/today/block/{id}`): checkboxes lead the rows;
 *   Edit beside ··· in the header; the Edit hint as the scope line while
 *   editing; every change today's only.
 * - `"editing"` (the editing tickets, `/days/block/{id}`): the usual
 *   weekday's block; no checkboxes; ··· alone (or Done beside it); the
 *   scope line "Every Monday."; the kinds' header rows in `kindRows`
 *   (Meal, Training for, Work fills it with, Checklist, no times).
 *
 * Top to bottom: the breadcrumb ("‹ Today › Wellness"), the header (the
 * colour bar, the name as a level-1 heading, its span, the actions), the
 * status line (offline), the scope line, the kinds' rows, then the body:
 * skeleton rows while the rows load (the header never waits), `RegionRetry`
 * when they fail, else the column. The mode sets only what the slots
 * default to; the screen wires the data. Props only.
 */
export type BlockViewMode = "day" | "editing";

export interface BlockViewCrumb {
  /** The place it returns to: "Today", "Monday". */
  label: string;
  href: string;
  /** "Back to Today". */
  ariaLabel: string;
  /** The leaf; the block's name unless set ("Checklist", D-USE-87). */
  current?: string;
}

export type BlockViewBody<R extends BlockViewRowModel> =
  /** The rows on their way: four skeleton rows. */
  | { state: "loading"; label: string }
  /** The rows failed: the caller's `RegionRetry`. */
  | { state: "error"; retry: React.ReactNode }
  | { state: "ready"; column: BlockViewColumnProps<R> }
  /** A kind drawn its own way: a Work block's tiers (USE-50). */
  | { state: "node"; node: React.ReactNode };

export interface BlockViewProps<R extends BlockViewRowModel> {
  mode: BlockViewMode;
  crumb: BlockViewCrumb;
  /** The block's name: the heading. */
  name: string;
  /** Under the name: "7:05 to 8:00", or "7:05 to 8:00 · every Monday". */
  meta: string;
  hue: BlockHue;
  /** Focus lands here on open (`tabIndex -1`). */
  headingRef?: React.Ref<HTMLHeadingElement>;
  /** In the heading's place: Rename's field. */
  titleField?: React.ReactNode;
  /** The header's trailing edge: Edit or Done, and ···. */
  actions?: React.ReactNode;
  /** In the header, under the name and actions: editing's span total (USE-156). */
  total?: React.ReactNode;
  /** Under the header, full width: the offline StatusLine. */
  status?: React.ReactNode;
  /** Edit's hint, or "Every Monday.": caption, muted, a hairline under. */
  scope?: string | null;
  /** Editing's kind rows, between the scope line and the rows. */
  kindRows?: React.ReactNode;
  body: BlockViewBody<R>;
  /** After the column: the tabs' room, a sheet, a live region. */
  children?: React.ReactNode;
  className?: string;
}

function BlockViewSkeleton({ label }: { label: string }) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      className="flex flex-col"
      data-block-view-loading
    >
      {["w-2/5", "w-1/4", "w-1/2", "w-1/3"].map((width) => (
        <div
          key={width}
          className="border-hairline ms-11 flex h-(--row-min) items-center gap-(--space-3) border-b"
        >
          <Skeleton className="size-5 rounded-(--radius)" />
          <Skeleton className={cn("h-3", width)} />
        </div>
      ))}
      <div className="border-hairline ms-11 h-(--row-min) border-b" />
    </section>
  );
}

export function BlockView<R extends BlockViewRowModel>({
  mode,
  crumb,
  name,
  meta,
  hue,
  headingRef,
  titleField = null,
  actions = null,
  total = null,
  status = null,
  scope = null,
  kindRows = null,
  body,
  children,
  className,
}: BlockViewProps<R>) {
  return (
    <div
      data-block-view={mode}
      className={cn(
        "mx-auto flex w-full max-w-(--content-text) flex-col",
        className,
      )}
    >
      <div className="px-(--space-4) pt-(--space-3)">
        <Breadcrumb
          label={crumb.label}
          href={crumb.href}
          ariaLabel={crumb.ariaLabel}
          current={crumb.current ?? name}
        />
        <div className="flex items-start gap-(--space-3) pt-(--space-2) pb-(--space-3)">
          <span
            aria-hidden="true"
            className={cn("mt-0.5 w-1 shrink-0 self-stretch", HUE_DOT[hue])}
          />
          <div className="min-w-0 flex-1">
            {titleField ?? (
              <Text
                as="h1"
                variant="heading"
                ref={headingRef}
                tabIndex={-1}
                className="break-words outline-none"
              >
                {name}
              </Text>
            )}
            <Text
              as="p"
              variant="caption"
              tone="muted"
              className="tabular-nums"
            >
              {meta}
            </Text>
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-(--space-1)">
              {actions}
            </div>
          ) : null}
        </div>
        {total ? <div className="pb-(--space-3)">{total}</div> : null}
      </div>
      <div className="border-hairline border-t">
        {status}
        {scope ? (
          <Text
            as="p"
            variant="caption"
            tone="muted"
            className="border-hairline border-b px-(--space-4) py-(--space-2)"
          >
            {scope}
          </Text>
        ) : null}
        {kindRows}
      </div>
      <div className="px-(--space-4) pt-(--space-1) pb-(--space-8)">
        {body.state === "loading" ? (
          <BlockViewSkeleton label={body.label} />
        ) : body.state === "error" ? (
          body.retry
        ) : body.state === "node" ? (
          body.node
        ) : (
          <BlockViewColumn {...body.column} />
        )}
      </div>
      {children}
    </div>
  );
}
