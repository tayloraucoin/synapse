"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { WorkSize } from "@syn/types";
import {
  Button,
  CloseIcon,
  cn,
  ExpandIcon,
  RegionRetry,
  ResponsiveSheet,
  SearchField,
  SearchIcon,
  SkeletonRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@syn/ui";
import {
  poolSheetView,
  type PoolSheetGroup,
  type PoolSheetView,
  type PoolSheetRow as Row,
} from "@/lib/data/pool-sheet";
import {
  DEFAULT_LINEAR_FILTERS,
  NO_POOL_FILTERS,
  type LinearFilters,
  type PoolDue,
  type PoolFilters,
  type PoolTab,
} from "@/lib/data/pool-view";
import { useAccount } from "@/lib/data/use-account";
import type { PlaceSheetSource } from "@/lib/data/use-place";
import { usePoolView } from "@/lib/data/use-pool-view";
import { SIZE_WORDS } from "@/lib/data/week-view";
import { itemSheetRoute, settingsRoute } from "@/lib/routes";
import { NewTaskSheet } from "../add/new-task/new-task-sheet";
import { ClientTile } from "../client-tile";
import { ClientFilterSheet } from "./client-filter-sheet";
import { POOL_SHEET_COPY as COPY } from "./copy";
import { FilterSheet } from "./filter-sheet";
import { PoolSheetRow } from "./pool-sheet-row";

/**
 * PoolSheet — the phone's pool over This week's day (USE-79;
 * ux/work/this-week/pool-sheet-anatomy.md, D-USE-54): "Pool" and ×; Pool and
 * From Linear as tabs (Connect Linear when nothing is connected, D-USE-56);
 * All clients, Size and Due date with the search glyph; on From Linear,
 * Assigned to <name> and Not done (on by default, D-USE-57) and the sync
 * line; the list by client in Taylor's order (D-USE-96) with team and
 * project lines and Place on each row. A row opens its Item sheet and
 * places nothing; Place hands the item to `onPlace` (USE-80's place sheet).
 * Search grows the sheet to full height and looks in both tabs. The
 * filters narrow this list only, never the days, and nothing here writes
 * to Linear.
 */
/** What Place hands the place sheet (USE-80). */
export type PoolPlaceRef = PlaceSheetSource;

type FilterSheetName = "client" | "size" | "due";

export interface PoolSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The day it opens over: due words count from it. */
  dateKey: string;
  onPlace: (ref: PoolPlaceRef) => void;
  /** Pool, on This week's day (USE-81): focus returns there on close. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** For a capture: the tab, a search, the filters, a filter sheet open. */
  initial?: {
    tab?: PoolTab;
    query?: string;
    filters?: Partial<PoolFilters>;
    filterSheet?: FilterSheetName;
  };
}

const SIZES: WorkSize[] = ["quick", "small", "medium", "large", "huge"];
const DUES: PoolDue[] = ["week", "today"];
const DUE_WORDS: Record<PoolDue, string> = {
  week: COPY.dueThisWeek,
  today: COPY.dueToday,
};

export function PoolSheet({
  open,
  onOpenChange,
  dateKey,
  onPlace,
  returnFocusRef,
  initial,
}: PoolSheetProps) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;
  const router = useRouter();
  const personName = (useAccount().data?.name ?? "").split(" ")[0] ?? "";

  const fresh = () => ({
    tab: initial?.tab ?? ("pool" as PoolTab),
    query: initial?.query ?? "",
    searching: initial?.query !== undefined,
    filters: { ...NO_POOL_FILTERS, ...initial?.filters },
    filterSheet: initial?.filterSheet ?? null,
  });
  const [tab, setTab] = React.useState<PoolTab>(() => fresh().tab);
  const [query, setQuery] = React.useState(() => fresh().query);
  const [searching, setSearching] = React.useState(() => fresh().searching);
  const [filters, setFilters] = React.useState<PoolFilters>(
    () => fresh().filters,
  );
  const [linearFilters, setLinearFilters] = React.useState<LinearFilters>(
    DEFAULT_LINEAR_FILTERS,
  );
  const [filterSheet, setFilterSheet] = React.useState<FilterSheetName | null>(
    () => fresh().filterSheet,
  );
  const [newTask, setNewTask] = React.useState<string | null>(null);
  const searchGlyphRef = React.useRef<HTMLButtonElement>(null);
  const newTaskRef = React.useRef<HTMLButtonElement>(null);

  // Each open starts from the props as they are then.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const start = fresh();
      setTab(start.tab);
      setQuery(start.query);
      setSearching(start.searching);
      setFilters(start.filters);
      setLinearFilters(DEFAULT_LINEAR_FILTERS);
      setFilterSheet(start.filterSheet);
      setNewTask(null);
    }
  }

  const pool = usePoolView({
    group: "client",
    sort: "due",
    query: searching ? query : "",
    tab,
    filters,
    linearFilters,
    dateKey,
  });
  const filtered =
    tab === "pool"
      ? filters.client !== null || filters.size !== null || filters.due !== null
      : filters.client !== null ||
        !linearFilters.assigned ||
        !linearFilters.notDone;
  const view: PoolSheetView | null = pool.view
    ? poolSheetView({ panel: pool.view, tab, slots: pool.slots, filtered })
    : null;
  const connected = view?.linearConnected ?? true;
  const clientsOn = pool.clientsEnabled;
  const pickedClient = view?.clientChoices.find((c) => c.id === filters.client);

  function place(row: Row) {
    if (row.workItemId) {
      onPlace({ kind: "item", workItemId: row.workItemId, title: row.title });
    } else if (row.issue) {
      onPlace({
        kind: "issue",
        ...row.issue,
        title: row.title,
        identifier: row.identifier,
        size: row.sizeKey,
        clientName: row.clientName,
      });
    }
  }

  function cancelSearch() {
    setQuery("");
    setSearching(false);
    // Back at 724 on the tab it came from, focus on the glyph that opened it.
    requestAnimationFrame(() => searchGlyphRef.current?.focus());
  }

  const header = searching ? (
    <div className="flex min-w-0 flex-1 items-center gap-2.5">
      <SearchField
        aria-label={COPY.searchField}
        value={query}
        autoFocus
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        onClick={cancelSearch}
        className="text-(length:--fs-body) text-foreground h-(--target) shrink-0 font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {COPY.cancel}
      </button>
    </div>
  ) : (
    <div className="flex h-(--target) min-w-0 flex-1 items-center justify-between">
      <Text as="h2" variant="heading" tabIndex={-1} className="outline-none">
        {COPY.title}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.close}
        onClick={() => onOpenChange(false)}
        className="text-foreground -me-(--space-3)"
      >
        <CloseIcon aria-hidden="true" className="size-3" />
      </Button>
    </div>
  );

  const rowHref = (row: Row) =>
    row.workItemId ? itemSheetRoute(here, row.workItemId) : undefined;

  let body: React.ReactNode;
  if (pool.isError) {
    body = (
      <RegionRetry label={COPY.failed} onRetry={() => void pool.retry()} />
    );
  } else if (!view) {
    body = (
      <div aria-busy="true" aria-label={COPY.loading}>
        {[0, 1, 2, 3].map((n) => (
          <SkeletonRow key={n} className="px-0" />
        ))}
      </div>
    );
  } else if (searching) {
    body = (
      <SearchResults
        view={view}
        query={query}
        rowHref={rowHref}
        onPlace={place}
        newTaskRef={newTaskRef}
        onNewTask={() => setNewTask(query.trim())}
      />
    );
  }

  const pills = (
    <div className="flex items-center gap-1.5 pt-2.5 pb-1">
      {clientsOn ? (
        <Pill
          label={pickedClient?.name ?? COPY.allClients}
          name={COPY.filterName(
            COPY.client,
            pickedClient?.name ?? COPY.allClients,
          )}
          onClick={() => setFilterSheet("client")}
        />
      ) : null}
      {tab === "pool" ? (
        <>
          <Pill
            label={filters.size ? SIZE_WORDS[filters.size] : COPY.size}
            name={COPY.filterName(
              COPY.size,
              filters.size ? SIZE_WORDS[filters.size] : COPY.any,
            )}
            onClick={() => setFilterSheet("size")}
          />
          <Pill
            label={filters.due ? DUE_WORDS[filters.due] : COPY.dueDate}
            name={COPY.filterName(
              COPY.dueDate,
              filters.due ? DUE_WORDS[filters.due] : COPY.any,
            )}
            onClick={() => setFilterSheet("due")}
          />
        </>
      ) : (
        <>
          <Toggle
            label={COPY.assignedTo(personName)}
            on={linearFilters.assigned}
            onClick={() =>
              setLinearFilters({
                ...linearFilters,
                assigned: !linearFilters.assigned,
              })
            }
          />
          <Toggle
            label={COPY.notDone}
            on={linearFilters.notDone}
            onClick={() =>
              setLinearFilters({
                ...linearFilters,
                notDone: !linearFilters.notDone,
              })
            }
          />
        </>
      )}
      <button
        ref={searchGlyphRef}
        type="button"
        aria-label={COPY.searchGlyph}
        onClick={() => setSearching(true)}
        // A 32 slot drawn, a 44 target kept.
        className="text-foreground relative ms-auto inline-flex size-8 shrink-0 items-center justify-center rounded-(--radius-control) after:absolute after:-inset-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <SearchIcon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );

  const tabBody = (value: PoolTab): React.ReactNode => {
    if (body) return body;
    if (!view) return null;
    if (value === "linear" && !connected) {
      return (
        // Under the tabs, never centred (A-08).
        <div className="flex flex-col gap-(--space-4) pt-(--space-6)">
          <div className="flex flex-col gap-1.5">
            <Text as="h3" variant="row-title" className="font-semibold">
              {COPY.notConnected}
            </Text>
            <Text as="p" variant="body" tone="muted">
              {COPY.notConnectedLine(personName)}
            </Text>
          </div>
          <Button
            size="lg"
            className="w-full rounded-(--radius-control)"
            onClick={() => {
              onOpenChange(false);
              router.push(settingsRoute());
            }}
          >
            {COPY.openSettings}
          </Button>
        </div>
      );
    }
    if (value === "pool" && view.empty) {
      return (
        <div className="flex flex-col gap-(--space-4) pt-(--space-6)">
          <div className="flex flex-col gap-1.5">
            <Text as="h3" variant="row-title" className="font-semibold">
              {COPY.empty}
            </Text>
            <Text as="p" variant="body" tone="muted">
              {COPY.emptyLine}
            </Text>
          </div>
          <div className="grid grid-cols-2 gap-(--space-2)">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-(--radius-control)"
              onClick={() => setTab("linear")}
            >
              {COPY.fromLinear}
            </Button>
            <Button
              ref={newTaskRef}
              size="lg"
              className="rounded-(--radius-control)"
              onClick={() => setNewTask("")}
            >
              {COPY.newTask}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <>
        {pills}
        {value === "linear" && view.sync ? (
          <div className="flex items-center justify-between pt-1.5 pb-0.5">
            <Text as="span" variant="caption" tone="muted">
              {view.sync}
            </Text>
            <button
              type="button"
              onClick={() => void pool.syncNow()}
              disabled={pool.isSyncing}
              className="text-(length:--fs-secondary) text-foreground font-semibold disabled:opacity-60"
            >
              {pool.isSyncing ? COPY.syncing : COPY.syncNow}
            </button>
          </div>
        ) : null}
        {view.groups.length === 0 ? (
          <Text as="p" variant="body" tone="muted" className="pt-(--space-4)">
            {view.filteredOut ? COPY.filteredOut : COPY.linearNothing}
          </Text>
        ) : (
          <GroupList
            groups={view.groups}
            // The Pool tab's frame draws no team and project lines [ASSUMPTION].
            showLines={value === "linear"}
            rowHref={rowHref}
            onPlace={place}
          />
        )}
        {value === "pool" ? (
          <Text
            as="p"
            variant="secondary"
            tone="muted"
            className="pt-(--space-4)"
          >
            {COPY.foot}
          </Text>
        ) : null}
      </>
    );
  };

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.title}
        header={header}
        headerAction={null}
        returnFocusRef={returnFocusRef}
        initialFocus={searching ? "first-field" : "title"}
        size="tall"
        classes={{
          // 724 tall over the day; search grows it to the top row (818).
          content: cn(
            "bg-background",
            searching
              ? "data-[vaul-drawer-direction=bottom]:h-[calc(100dvh-var(--header-h))] data-[vaul-drawer-direction=bottom]:max-h-none"
              : "data-[vaul-drawer-direction=bottom]:h-[83dvh]",
          ),
          header: "min-h-0 px-5 pt-(--space-2)",
          body: "flex flex-col px-5 pt-(--space-3) pb-(--space-8)",
        }}
      >
        {searching ? (
          body
        ) : (
          <Tabs
            value={tab}
            onValueChange={(next) => setTab(next as PoolTab)}
            className="gap-0"
          >
            <TabsList
              aria-label={COPY.tabs}
              className="bg-surface h-10 w-full gap-0.5 rounded-(--radius-control) p-0.75"
            >
              {(["pool", "linear"] as const).map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-(length:--fs-secondary) text-muted-foreground data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:text-foreground h-full rounded-(--radius-sm) border border-transparent data-[state=active]:font-semibold"
                >
                  {value === "pool"
                    ? COPY.pool
                    : connected
                      ? COPY.fromLinear
                      : COPY.connectLinear}
                </TabsTrigger>
              ))}
            </TabsList>
            {(["pool", "linear"] as const).map((value) => (
              <TabsContent key={value} value={value} className="flex flex-col">
                {tab === value ? tabBody(value) : null}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </ResponsiveSheet>
      <ClientFilterSheet
        open={filterSheet === "client"}
        onOpenChange={(next) => setFilterSheet(next ? "client" : null)}
        clients={view?.clientChoices ?? []}
        value={filters.client}
        onPick={(client) => setFilters({ ...filters, client })}
      />
      <FilterSheet<WorkSize | null>
        open={filterSheet === "size"}
        onOpenChange={(next) => setFilterSheet(next ? "size" : null)}
        title={COPY.size}
        value={filters.size}
        onPick={(size) => setFilters({ ...filters, size })}
        choices={[
          { value: null, label: COPY.any },
          ...SIZES.map((size) => ({ value: size, label: SIZE_WORDS[size] })),
        ]}
      />
      <FilterSheet<PoolDue | null>
        open={filterSheet === "due"}
        onOpenChange={(next) => setFilterSheet(next ? "due" : null)}
        title={COPY.dueDate}
        value={filters.due}
        onPick={(due) => setFilters({ ...filters, due })}
        choices={[
          { value: null, label: COPY.any },
          ...DUES.map((due) => ({ value: due, label: DUE_WORDS[due] })),
        ]}
      />
      <NewTaskSheet
        open={newTask !== null}
        onOpenChange={(next) => {
          if (!next) setNewTask(null);
        }}
        dateKey={dateKey}
        from="pool"
        initial={newTask ? { title: newTask } : undefined}
        returnFocusRef={newTaskRef}
      />
    </>
  );
}

const PILL =
  "relative inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-2.5 text-(length:--fs-secondary) font-medium after:absolute after:-inset-x-0 after:-inset-y-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function Pill({
  label,
  name,
  onClick,
}: {
  label: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={name}
      aria-haspopup="dialog"
      onClick={onClick}
      className={cn(PILL, "border-border bg-background text-foreground")}
    >
      <span className="max-w-32 truncate">{label}</span>
      <ExpandIcon aria-hidden="true" className="size-3.5" />
    </button>
  );
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        PILL,
        on
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border bg-background text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function GroupList({
  groups,
  showLines,
  rowHref,
  onPlace,
}: {
  groups: PoolSheetGroup[];
  showLines: boolean;
  rowHref: (row: Row) => string | undefined;
  onPlace: (row: Row) => void;
}) {
  return (
    <div className="flex flex-col">
      {groups.map((group) => (
        <section key={group.key} data-pool-sheet-group={group.key}>
          <h3 className="flex items-center gap-(--space-2) pt-3">
            {group.head.kind === "client" ? (
              <ClientTile
                letter={group.head.letter}
                hue={group.head.hue}
                className="font-bold"
              />
            ) : group.head.emoji ? (
              <span aria-hidden="true" className="font-emoji">
                {group.head.emoji}
              </span>
            ) : null}
            <span className="text-(length:--fs-secondary) text-foreground font-semibold">
              {group.head.name}
            </span>
          </h3>
          {group.lines.map((line) => (
            <div key={line.key}>
              {showLines && (line.team || line.project) ? (
                <p className="text-caption text-muted-foreground ps-6 pt-1">
                  {[
                    line.team
                      ? [line.team.emoji, line.team.name]
                          .filter(Boolean)
                          .join(" ")
                      : null,
                    line.project
                      ? [line.project.emoji, line.project.name]
                          .filter(Boolean)
                          .join(" ")
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              <ul className="flex flex-col">
                {line.rows.map((row) => (
                  <PoolSheetRow
                    key={row.key}
                    row={row}
                    href={rowHref(row)}
                    onPlace={() => onPlace(row)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function SearchResults({
  view,
  query,
  rowHref,
  onPlace,
  newTaskRef,
  onNewTask,
}: {
  view: PoolSheetView;
  query: string;
  rowHref: (row: Row) => string | undefined;
  onPlace: (row: Row) => void;
  newTaskRef: React.RefObject<HTMLButtonElement | null>;
  onNewTask: () => void;
}) {
  if (!query.trim() || !view.search) {
    return (
      <Text as="p" variant="caption" tone="muted" className="pt-(--space-3)">
        {COPY.searchScope}
      </Text>
    );
  }
  return (
    <div className="flex flex-col">
      <Text as="p" variant="caption" tone="muted" className="pt-(--space-3)">
        {COPY.searchScope}
      </Text>
      <ul aria-live="polite" className="flex flex-col">
        {view.search.noMatch ? (
          <li className="flex min-h-15 items-center">
            <button
              ref={newTaskRef}
              type="button"
              onClick={onNewTask}
              className="text-(length:--fs-body) text-foreground min-h-(--target) text-start font-medium underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {COPY.noMatch}
            </button>
          </li>
        ) : (
          view.search.rows.map((row) => (
            <PoolSheetRow
              key={row.key}
              row={row}
              href={rowHref(row)}
              onPlace={() => onPlace(row)}
            />
          ))
        )}
      </ul>
    </div>
  );
}
