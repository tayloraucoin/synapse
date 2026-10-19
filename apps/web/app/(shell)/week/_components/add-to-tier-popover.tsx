"use client";

import * as React from "react";
import type { WorkTier } from "@syn/types";
import {
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SearchField,
} from "@syn/ui";
import { PLACE_IDS, readPlaceId, type PlaceSource } from "@/lib/data/place";
import type { PoolRowView } from "@/lib/data/pool-view";
import { useIsOffline } from "@/lib/data/source";
import { usePoolView } from "@/lib/data/use-pool-view";
import { TIER_WORDS } from "@/lib/data/week-view";
import { WEEK_COPY as COPY } from "./copy";

/**
 * "+ Add to <tier>" and its one search (USE-75, D-USE-41; popovers.md): the
 * cell's add button, shown on hover and on focus alike (never hover only),
 * opening "Add to <Day> · <Tier>" under the cell. One combobox over Pool
 * first, then "Linear, not in the pool yet" (online only: Linear's results
 * wait for the connection), then '+ New item "<query>"'; it searches title
 * and ID (`poolView`'s search, the pool panel's). Arrows move through every
 * result across the groups (their names are not stops), Enter picks, Esc
 * closes and focus returns to the add button. [ASSUMPTION] With nothing
 * typed it lists the pool, in its order; no Command primitive exists in
 * `@syn/ui`, so the combobox is the ARIA pattern drawn here.
 */

export interface AddToTierPopoverProps {
  weekday: string;
  tier: WorkTier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A result picked: it lands in the cell as a drop does. */
  onPick: (from: PlaceSource & { title: string }) => void;
  /** '+ New item "<query>"': New task with the title, day and tier filled. */
  onNewItem: (title: string) => void;
  /** A capture's words, typed when it opens. */
  initialQuery?: string;
  /**
   * `cell` (a Priority cell's): shown on hover and on focus. `row` (the Block
   * panel's tier, USE-76): "+ Add to <tier>" always shown, subtle, 32 px.
   */
  trigger?: "cell" | "row";
  /** The day in the trigger's name: "Add to Primary, Tue 13" (USE-76). */
  triggerName?: string;
}

interface Option {
  id: string;
  kind: "pool" | "linear" | "new";
  row: PoolRowView | null;
}

export function AddToTierPopover({
  weekday,
  tier,
  open,
  onOpenChange,
  onPick,
  onNewItem,
  initialQuery = "",
  trigger = "cell",
  triggerName,
}: AddToTierPopoverProps) {
  const tierWord = TIER_WORDS[tier];
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={triggerName ?? COPY.addName(weekday, tierWord)}
          className={cn(
            trigger === "row"
              ? "h-8 self-start whitespace-nowrap rounded-(--radius-control) ps-7 text-(length:--fs-label) text-text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
              : [
                  "h-7 self-start whitespace-nowrap rounded-(--radius-control) border border-input bg-background px-2 text-caption text-ink",
                  "opacity-0 outline-none group-hover/cell:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring",
                  open && "opacity-100",
                ],
          )}
        >
          {COPY.addTo(tierWord)}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-85 rounded-(--radius-sheet) border-hairline p-0 shadow-menu"
      >
        {open ? (
          <AddSearch
            title={COPY.addTitle(weekday, tierWord)}
            initialQuery={initialQuery}
            onPick={(from) => {
              onOpenChange(false);
              onPick(from);
            }}
            onNewItem={(title) => {
              onOpenChange(false);
              onNewItem(title);
            }}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function AddSearch({
  title,
  initialQuery,
  onPick,
  onNewItem,
}: {
  title: string;
  initialQuery: string;
  onPick: (from: PlaceSource & { title: string }) => void;
  onNewItem: (title: string) => void;
}) {
  const [query, setQuery] = React.useState(initialQuery);
  const [active, setActive] = React.useState(0);
  const offline = useIsOffline();
  const pool = usePoolView({
    group: "client",
    sort: "due",
    query,
    tab: "pool",
  });
  const listId = React.useId();
  const titleId = React.useId();
  const trimmed = query.trim();

  const view = pool.view;
  const poolRows: PoolRowView[] = view?.search
    ? view.search.pool
    : (view?.groups ?? []).flatMap((g) => g.lines.flatMap((l) => l.rows));
  const linearRows = view?.search && !offline ? view.search.linear : [];
  const options: Option[] = [
    ...poolRows.map((row) => ({ id: row.key, kind: "pool" as const, row })),
    ...linearRows.map((row) => ({
      id: row.key,
      kind: "linear" as const,
      row,
    })),
    ...(trimmed ? [{ id: "new", kind: "new" as const, row: null }] : []),
  ];
  const current = Math.min(active, Math.max(0, options.length - 1));
  const optionId = (index: number) => `${listId}-${index}`;

  React.useEffect(() => setActive(0), [query]);

  const pick = (option: Option | undefined) => {
    if (!option) return;
    if (option.kind === "new" || !option.row) {
      onNewItem(trimmed);
      return;
    }
    const read = readPlaceId(PLACE_IDS.row(option.row.key));
    if (read?.kind !== "row") return;
    onPick({ ...read.source, title: option.row.title });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current + 1) % Math.max(1, options.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(
        (current - 1 + Math.max(1, options.length)) %
          Math.max(1, options.length),
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      pick(options[current]);
    }
  };

  const groups: { word: string; kind: Option["kind"] }[] = [
    { word: COPY.poolGroup, kind: "pool" },
    { word: COPY.linearGroup, kind: "linear" },
  ];

  return (
    <div className="flex flex-col gap-(--space-3) p-(--space-3)">
      <p
        id={titleId}
        className="px-1 text-label font-semibold text-muted-foreground"
      >
        {title}
      </p>
      <SearchField
        aria-label={title}
        placeholder={COPY.addSearch}
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          options.length > 0 ? optionId(current) : undefined
        }
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        onKeyDown={onKeyDown}
        classes={{
          input:
            "h-9 border-ring bg-background ring-2 ring-ring/30 focus-visible:ring-ring/30",
        }}
      />
      <div
        id={listId}
        role="listbox"
        aria-labelledby={titleId}
        className="flex max-h-80 flex-col overflow-y-auto"
      >
        {groups.map((group) => {
          const rows = options
            .map((option, index) => ({ option, index }))
            .filter(({ option }) => option.kind === group.kind);
          if (rows.length === 0) return null;
          const headId = `${listId}-${group.kind}`;
          return (
            <div
              key={group.kind}
              role="group"
              aria-labelledby={headId}
              className="flex flex-col pb-1"
            >
              <p
                id={headId}
                role="presentation"
                className="px-1 pt-1 pb-1.5 text-caption text-muted-foreground"
              >
                {group.word}
              </p>
              {rows.map(({ option, index }) => (
                <Result
                  key={option.id}
                  id={optionId(index)}
                  row={option.row!}
                  active={index === current}
                  onHover={() => setActive(index)}
                  onPick={() => pick(option)}
                />
              ))}
            </div>
          );
        })}
        {poolRows.length + linearRows.length === 0 && view ? (
          <p className="px-1 py-1.5 text-caption text-muted-foreground">
            {COPY.addNoMatch}
          </p>
        ) : null}
        {trimmed ? (
          <>
            <div
              role="presentation"
              className="my-1 border-t border-hairline"
            />
            <div
              id={optionId(options.length - 1)}
              role="option"
              aria-selected={current === options.length - 1}
              onMouseEnter={() => setActive(options.length - 1)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(options.at(-1))}
              className={cn(
                "cursor-pointer rounded-(--radius-control) px-2 py-2 text-label text-ink",
                current === options.length - 1 && "bg-surface",
              )}
            >
              {COPY.addNewItem(trimmed)}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Result({
  id,
  row,
  active,
  onHover,
  onPick,
}: {
  id: string;
  row: PoolRowView;
  active: boolean;
  onHover: () => void;
  onPick: () => void;
}) {
  const meta = [row.identifier, row.size].filter(Boolean).join(" · ");
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      aria-label={[row.title, meta].filter(Boolean).join(", ")}
      onMouseEnter={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onPick}
      className={cn(
        "flex cursor-pointer items-center gap-(--space-2) rounded-(--radius-control) px-2 py-2",
        active && "bg-surface",
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-4.5 shrink-0 items-center justify-center font-emoji text-label leading-none"
      >
        {row.emoji}
      </span>
      <span className="min-w-0 flex-1 truncate text-label text-ink">
        {row.title}
      </span>
      <span className="shrink-0 text-caption text-muted-foreground">
        {meta}
      </span>
    </div>
  );
}
