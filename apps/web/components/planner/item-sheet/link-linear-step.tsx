"use client";

import * as React from "react";
import {
  BackIcon,
  Button,
  cn,
  ItemIcon,
  SearchField,
  SegmentedControl,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";
import {
  ALL_TAB,
  type LinkListView,
  type LinkRow,
} from "@/lib/data/item-sheet-link";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.link;
const SIZES = ITEM_SHEET_COPY.work.sizes;

/**
 * LinkLinearStep — "Link a Linear issue", a step inside a work item's sheet
 * (USE-68; linear-search.md): back on the left with the item's name, the
 * scope and the title, Search Linear issues, All and a tab per workspace,
 * then "Assigned to Taylor" and "Other open issues", each row the project
 * emoji, the title, "<project> · <ID> · <range>" and "<points> <size>" on
 * the right; one already on today greyed with where it sits, inert. One tap
 * links, so no primary; the footer line says what linking takes.
 *
 * The search and the tabs filter the snapshot handed in (`list`), held on
 * the device; nothing here asks Linear. Loading draws SkeletonRows under the
 * tabs; offline, the area's StatusLine over the last-synced issues
 * [ASSUMPTION, offline.md]. Props only.
 */
export interface LinkLinearStepProps {
  itemTitle: string;
  scope: string;
  /** The list for `tab` and `query`; null while the snapshot loads. */
  list: (tab: string, query: string) => LinkListView | null;
  /** "Assigned to <name>". */
  person: string | null;
  offline: boolean;
  onPick: (row: LinkRow) => void;
  onBack: () => void;
  headingRef: React.Ref<HTMLHeadingElement>;
}

export function LinkLinearStep({
  itemTitle,
  scope,
  list,
  person,
  offline,
  onPick,
  onBack,
  headingRef,
}: LinkLinearStepProps) {
  const headingId = React.useId();
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState(ALL_TAB);
  const view = list(tab, query);
  const searching = query.trim() !== "";

  const group = (key: string, heading: string, rows: readonly LinkRow[]) =>
    rows.length === 0 ? null : (
      <section key={key} aria-labelledby={`${headingId}-${key}`}>
        <Text
          as="h3"
          id={`${headingId}-${key}`}
          variant="secondary"
          tone="secondary"
          className="pt-(--space-4) pb-(--space-1) font-medium"
        >
          {heading}
        </Text>
        <ul className="flex flex-col">
          {rows.map((row) => (
            <li key={row.key} className="border-hairline border-b">
              <IssueRow row={row} onPick={onPick} />
            </li>
          ))}
        </ul>
      </section>
    );

  const empty =
    view !== null && view.assigned.length === 0 && view.other.length === 0;

  return (
    <div className="flex min-h-full flex-col">
      <Button
        variant="ghost"
        onClick={onBack}
        aria-label={COPY.back(itemTitle)}
        className="-ms-(--space-3) max-w-full gap-(--space-2) self-start px-(--space-3) font-normal"
      >
        <BackIcon aria-hidden="true" className="size-4 shrink-0" />
        <span className="truncate">{itemTitle}</span>
      </Button>
      <Text
        as="p"
        variant="secondary"
        tone="secondary"
        className="pt-(--space-2)"
      >
        {scope}
      </Text>
      <Text
        ref={headingRef}
        as="h2"
        id={headingId}
        variant="heading"
        tabIndex={-1}
        className="outline-none"
      >
        {COPY.title}
      </Text>

      <div className="flex flex-col gap-(--space-3) pt-(--space-4)">
        <SearchField
          aria-label={COPY.search}
          placeholder={COPY.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
        {view === null || view.workspaces.length === 0 ? null : (
          <SegmentedControl
            label={COPY.tabs}
            stacked={false}
            value={tab}
            onChange={setTab}
            options={[{ value: ALL_TAB, label: COPY.all }, ...view.workspaces]}
            classes={{
              label: "sr-only",
              group: "bg-surface gap-0 border-0 p-(--space-1)",
              item: cn(
                "bg-surface text-muted-foreground h-9 rounded-(--radius-control) font-normal",
                "has-checked:bg-background has-checked:text-foreground has-checked:font-semibold",
              ),
            }}
          />
        )}
      </div>

      {offline ? (
        <StatusLine
          variant="offline"
          text={COPY.offline}
          placement="inline"
          className="mt-(--space-3)"
        />
      ) : null}

      <div aria-live="polite" className="flex flex-col">
        {view === null ? (
          <div className="flex flex-col pt-(--space-4)">
            <SkeletonRow leading lines={2} />
            <SkeletonRow leading lines={2} />
            <SkeletonRow leading lines={2} />
          </div>
        ) : empty ? (
          <Text
            as="p"
            variant="body"
            tone="secondary"
            className="pt-(--space-4)"
          >
            {searching ? COPY.noMatch : COPY.none}
          </Text>
        ) : (
          <>
            {group("assigned", COPY.assigned(person), view.assigned)}
            {group("other", COPY.other, view.other)}
          </>
        )}
      </div>

      <Text
        as="p"
        variant="secondary"
        tone="secondary"
        className="mt-auto pt-(--space-6)"
      >
        {COPY.footer}
      </Text>
    </div>
  );
}

function IssueRow({
  row,
  onPick,
}: {
  row: LinkRow;
  onPick: (row: LinkRow) => void;
}) {
  const greyed = row.onToday !== undefined;
  const icon =
    row.emoji === null ? null : (
      <ItemIcon icon={{ kind: "emoji", value: row.emoji }} size={20} />
    );
  const body = (
    <>
      <span
        aria-hidden="true"
        className="inline-flex size-6 shrink-0 items-center justify-center"
      >
        {greyed ? (
          <ItemIcon icon={row.itemIcon ?? null} size={20} muted />
        ) : (
          icon
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <Text as="span" variant="body" truncate>
          {row.title}
        </Text>
        <Text as="span" variant="caption" tone="secondary" truncate>
          {row.meta}
        </Text>
      </span>
      {row.size === null ? null : (
        <Text as="span" variant="secondary" className="shrink-0">
          {`${row.size.points} ${SIZES[row.size.size]}`}
        </Text>
      )}
    </>
  );
  const shape =
    "flex min-h-14 w-full items-center gap-(--space-3) py-(--space-2) text-start";
  // Already on today: shown with where it sits, never a choice.
  if (greyed) {
    return (
      <div aria-disabled="true" className={cn(shape, "opacity-55")}>
        {body}
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-label={COPY.linkName(row.identifier, row.title)}
      onClick={() => onPick(row)}
      className={cn(
        shape,
        "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
      )}
    >
      {body}
    </button>
  );
}
