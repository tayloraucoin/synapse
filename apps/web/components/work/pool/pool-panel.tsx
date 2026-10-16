"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  cn,
  DoneIcon,
  RegionRetry,
  SearchField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SkeletonRow,
  SortableList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  useDropTarget,
  type SortableHandleProps,
} from "@syn/ui";
import { PLACE_IDS } from "@/lib/data/place";
import {
  POOL_WORDS,
  type PoolGroupBy,
  type PoolGroupView,
  type PoolLineView,
  type PoolPanelView,
  type PoolRowView,
  type PoolSort,
  type PoolTab,
} from "@/lib/data/pool-view";
import { useDataSource } from "@/lib/data/source";
import { useAccount } from "@/lib/data/use-account";
import { usePoolView } from "@/lib/data/use-pool-view";
import { useRememberedToggle } from "@/lib/hooks/use-remembered-toggle";
import { itemSheetRoute } from "@/lib/routes";
import { NewTaskSheet } from "../add/new-task/new-task-sheet";
import { ClientHead } from "./client-head";
import { POOL_PANEL_COPY as COPY } from "./copy";
import { PoolRow } from "./pool-row";

/**
 * PoolPanel — the desk's pool (USE-74; ux/work/week/pool-panel.md): 360 wide,
 * full height on surface, docked on the Week (and later beside the Block
 * panel and on Today with nothing planned). Pool and Linear tabs (Linear
 * only when connected, D-USE-41, D-USE-101), Group and Sort, Search across
 * both tabs, the list by client in Taylor's one order with grips and
 * collapses (D-USE-96), + New item in the pool (never created in Linear,
 * D-USE-57) and the sync line with Sync now. Everything runs on the device.
 */
export interface PoolPanelProps {
  mode: "week" | "today" | "beside-panel";
}

const GROUPS: PoolGroupBy[] = ["client", "workspace", "project"];
const SORTS: PoolSort[] = ["due", "priority", "updated"];

export function PoolPanel({ mode }: PoolPanelProps) {
  const source = useDataSource();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;
  // `pool:linear` opens a capture on the Linear tab (states/linear-tab.md).
  const [tab, setTab] = React.useState<PoolTab>(
    source.scenario.view?.open === "pool:linear" ? "linear" : "pool",
  );
  const [group, setGroup] = React.useState<PoolGroupBy>("client");
  const [sort, setSort] = React.useState<PoolSort>("due");
  const [query, setQuery] = React.useState("");
  const [newOpen, setNewOpen] = React.useState(false);
  const newRef = React.useRef<HTMLButtonElement>(null);
  const personName = (useAccount().data?.name ?? "").split(" ")[0] ?? "";
  const pool = usePoolView({ group, sort, query, tab });
  const view = pool.view;
  const shownTab: PoolTab = view?.linearConnected ? tab : "pool";
  // A placed chip carried back here returns to the pool (USE-75).
  const drop = useDropTarget(PLACE_IDS.pool);
  const takesChip = drop.carriedId?.startsWith("chip:") ?? false;

  const openItem = (id: string) => itemSheetRoute(here, id);
  // [ASSUMPTION] Spread's dialog is USE-77's; until then Spread… opens the Item sheet.
  const spread = (id: string) =>
    router.push(itemSheetRoute(here, id), { scroll: false });

  const body = (
    <PanelBody
      view={view}
      tab={shownTab}
      isError={pool.isError}
      onRetry={() => void pool.retry()}
      openItem={openItem}
      onSpread={spread}
      onReorder={(ids) => void pool.reorderClients(ids)}
      onFromLinear={() => setTab("linear")}
    />
  );

  return (
    <aside
      ref={drop.ref}
      aria-label={COPY.pool}
      data-pool-panel={mode}
      className={cn(
        "sticky top-0 flex h-dvh w-(--pool-w) shrink-0 flex-col gap-3.5 border-e border-border bg-surface px-5 py-(--space-6)",
        takesChip && drop.isOver && "bg-fill-muted",
      )}
    >
      {view?.linearConnected ? (
        <Tabs
          value={shownTab}
          onValueChange={(next) => setTab(next as PoolTab)}
          className="min-h-0 shrink gap-3.5"
        >
          <TabsList
            aria-label={COPY.tabs}
            className="bg-fill-muted h-auto w-full rounded-(--radius-control) p-0.75"
          >
            {(["pool", "linear"] as const).map((value) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-label text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground h-8 rounded-(--radius-control) data-[state=active]:font-semibold"
              >
                {value === "pool" ? COPY.pool : COPY.linear}
              </TabsTrigger>
            ))}
          </TabsList>
          <Controls
            group={group}
            sort={sort}
            query={query}
            onGroup={setGroup}
            onSort={setSort}
            onQuery={setQuery}
          />
          {(["pool", "linear"] as const).map((value) => (
            <TabsContent
              key={value}
              value={value}
              className="flex min-h-0 flex-col gap-3.5"
            >
              {value === "linear" ? (
                <LinearFilters personName={personName} />
              ) : null}
              {body}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex min-h-0 shrink flex-col gap-3.5">
          <Controls
            group={group}
            sort={sort}
            query={query}
            onGroup={setGroup}
            onSort={setSort}
            onQuery={setQuery}
          />
          {body}
        </div>
      )}
      {/* The New item sits under the list; the panel's foot holds the sync line. */}
      <div className="mt-1.5 flex shrink-0 flex-col">
        <button
          ref={newRef}
          type="button"
          onClick={() => setNewOpen(true)}
          className="border-input text-label text-muted-foreground hover:text-foreground h-9.5 rounded-(--radius-control) border border-dashed focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {view?.search ? view.search.newItem : COPY.newItem}
        </button>
        {view?.sync ? (
          <div className="mt-(--space-4) flex items-center justify-between border-t border-hairline pt-(--space-4)">
            <Text as="span" variant="caption" tone="muted">
              {view.sync}
            </Text>
            <button
              type="button"
              onClick={() => void pool.syncNow()}
              disabled={pool.isSyncing}
              className="text-caption text-foreground font-semibold underline underline-offset-2 disabled:opacity-60"
            >
              {pool.isSyncing ? COPY.syncing : COPY.syncNow}
            </button>
          </div>
        ) : null}
      </div>
      <NewTaskSheet
        open={newOpen}
        onOpenChange={setNewOpen}
        dateKey={pool.todayKey}
        from="pool"
        initial={query.trim() ? { title: query.trim() } : undefined}
        returnFocusRef={newRef}
      />
    </aside>
  );
}

function Controls({
  group,
  sort,
  query,
  onGroup,
  onSort,
  onQuery,
}: {
  group: PoolGroupBy;
  sort: PoolSort;
  query: string;
  onGroup: (next: PoolGroupBy) => void;
  onSort: (next: PoolSort) => void;
  onQuery: (next: string) => void;
}) {
  const trigger =
    "bg-background border-hairline text-label h-9 min-w-0 flex-1 rounded-(--radius-control)";
  return (
    <>
      <div className="flex gap-(--space-2)">
        <Select value={group} onValueChange={(v) => onGroup(v as PoolGroupBy)}>
          <SelectTrigger
            aria-label={COPY.groupName(POOL_WORDS.group[group])}
            className={trigger}
          >
            <span className="flex gap-1">
              {COPY.group}
              <SelectValue>{POOL_WORDS.group[group]}</SelectValue>
            </span>
          </SelectTrigger>
          <SelectContent position="popper">
            {GROUPS.map((value) => (
              <SelectItem key={value} value={value}>
                {POOL_WORDS.group[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => onSort(v as PoolSort)}>
          <SelectTrigger
            aria-label={COPY.sortName(POOL_WORDS.sort[sort])}
            className={trigger}
          >
            <span className="flex gap-1">
              {COPY.sort}
              <SelectValue>{POOL_WORDS.sort[sort]}</SelectValue>
            </span>
          </SelectTrigger>
          <SelectContent position="popper">
            {SORTS.map((value) => (
              <SelectItem key={value} value={value}>
                {POOL_WORDS.sort[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SearchField
        aria-label={COPY.search}
        placeholder={COPY.search}
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        onClear={() => onQuery("")}
        classes={{ input: "bg-background border-hairline h-9" }}
      />
    </>
  );
}

function LinearFilters({ personName }: { personName: string }) {
  return (
    <ul aria-label={COPY.filters} className="flex gap-(--space-2)">
      {[COPY.assignedTo(personName), COPY.notDone].map((word) => (
        <li
          key={word}
          className="border-hairline bg-background text-caption text-foreground inline-flex h-6 items-center gap-1 rounded-full border px-(--space-2)"
        >
          <DoneIcon aria-hidden="true" className="size-3" />
          {word}
        </li>
      ))}
    </ul>
  );
}

interface BodyProps {
  view: PoolPanelView | null;
  tab: PoolTab;
  isError: boolean;
  onRetry: () => void;
  openItem: (id: string) => string;
  onSpread: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onFromLinear: () => void;
}

function PanelBody({
  view,
  tab,
  isError,
  onRetry,
  openItem,
  onSpread,
  onReorder,
  onFromLinear,
}: BodyProps) {
  const rowProps = (row: PoolRowView) => ({
    row,
    href: row.workItemId ? openItem(row.workItemId) : undefined,
    onSpread: row.workItemId ? () => onSpread(row.workItemId!) : undefined,
    dragId: PLACE_IDS.row(row.key),
  });

  if (isError) return <RegionRetry label={COPY.poolFailed} onRetry={onRetry} />;
  if (!view) {
    return (
      <div aria-busy="true" aria-label={COPY.loading}>
        {[0, 1, 2, 3].map((n) => (
          <SkeletonRow key={n} className="px-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="-me-2 min-h-0 overflow-y-auto pe-2">
      {view.search ? (
        <SearchResults search={view.search} rowProps={rowProps} />
      ) : view.empty ? (
        // At the top of the list, never centred (A-08); no count.
        <div className="flex flex-col items-start gap-(--space-3)">
          <Text as="p" variant="body" tone="muted" className="text-label">
            {COPY.empty}
          </Text>
          {view.linearConnected ? (
            <button
              type="button"
              onClick={onFromLinear}
              className="text-label text-foreground font-semibold underline underline-offset-2"
            >
              {COPY.fromLinear}
            </button>
          ) : null}
        </div>
      ) : (
        <GroupList
          view={view}
          reorderable={tab === "pool" && view.byClient}
          rowProps={rowProps}
          onReorder={onReorder}
        />
      )}
    </div>
  );
}

type RowProps = (row: PoolRowView) => React.ComponentProps<typeof PoolRow>;

function SearchResults({
  search,
  rowProps,
}: {
  search: NonNullable<PoolPanelView["search"]>;
  rowProps: RowProps;
}) {
  const sections = [
    { word: POOL_WORDS.inPool, rows: search.pool },
    { word: POOL_WORDS.inLinear, rows: search.linear },
  ].filter((section) => section.rows.length > 0);
  return (
    <div className="flex flex-col gap-(--space-3)">
      {sections.length === 0 ? (
        <Text as="p" variant="caption" tone="muted">
          {COPY.noMatch}
        </Text>
      ) : null}
      {sections.map((section) => (
        <section key={section.word} aria-label={section.word}>
          <Text as="h3" variant="caption" tone="muted" className="pb-1">
            {section.word}
          </Text>
          {section.rows.map((row) => (
            <PoolRow key={row.key} {...rowProps(row)} />
          ))}
        </section>
      ))}
    </div>
  );
}

function GroupList({
  view,
  reorderable,
  rowProps,
  onReorder,
}: {
  view: PoolPanelView;
  reorderable: boolean;
  rowProps: RowProps;
  onReorder: (ids: string[]) => void;
}) {
  const clientGroups = view.groups.filter((g) => g.head.kind === "client");
  const otherGroups = view.groups.filter((g) => g.head.kind !== "client");
  const items = clientGroups.map((g) => ({
    id: g.head.kind === "client" ? g.head.id : g.key,
    title: g.head.name,
    group: g,
  }));
  return (
    <div className="flex flex-col">
      {reorderable ? (
        <Text as="p" variant="caption" tone="muted" className="pb-(--space-2)">
          {COPY.orderLine}
        </Text>
      ) : null}
      {reorderable && items.length > 0 ? (
        <SortableList
          label={COPY.clients}
          items={items}
          onReorder={onReorder}
          itemClassName="block"
          renderItem={(item, state) => (
            <Group
              group={item.group}
              rowProps={rowProps}
              handleProps={state.handleProps}
            />
          )}
        />
      ) : (
        clientGroups.map((g) => (
          <Group key={g.key} group={g} rowProps={rowProps} />
        ))
      )}
      {otherGroups.map((g) => (
        <Group key={g.key} group={g} rowProps={rowProps} />
      ))}
    </div>
  );
}

function Group({
  group,
  rowProps,
  handleProps,
}: {
  group: PoolGroupView;
  rowProps: RowProps;
  handleProps?: SortableHandleProps;
}) {
  const [collapsed, setCollapsed] = useRememberedToggle(
    `synapse.pool.collapsed.${group.key}`,
    false,
  );
  const bodyId = React.useId();
  return (
    <div data-pool-group={group.key} className="pb-(--space-2)">
      <ClientHead
        head={group.head}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        handleProps={handleProps}
        bodyId={bodyId}
      />
      <div id={bodyId} hidden={collapsed}>
        {group.lines.map((line) => (
          <Line key={line.key} line={line} rowProps={rowProps} />
        ))}
      </div>
    </div>
  );
}

function Line({ line, rowProps }: { line: PoolLineView; rowProps: RowProps }) {
  const hasLine = line.team !== null || line.project !== null;
  return (
    <div className="ps-5">
      {hasLine ? (
        <p className="text-caption flex h-6.5 items-center gap-1 truncate">
          {line.team ? (
            <span className="text-muted-foreground flex items-center gap-1 font-semibold">
              {line.team.emoji ? (
                <span
                  aria-hidden="true"
                  className="font-emoji inline-flex w-4.5 justify-center"
                >
                  {line.team.emoji}
                </span>
              ) : null}
              {line.team.name}
            </span>
          ) : null}
          {line.project ? (
            <span
              className={cn(
                "flex items-center gap-1",
                line.team
                  ? "text-text-muted"
                  : "text-muted-foreground font-semibold",
              )}
            >
              {line.team ? <span aria-hidden="true">·</span> : null}
              {line.project.emoji ? (
                <span aria-hidden="true" className="font-emoji">
                  {line.project.emoji}
                </span>
              ) : null}
              {line.project.name}
            </span>
          ) : null}
        </p>
      ) : null}
      {line.rows.map((row) => (
        <PoolRow key={row.key} {...rowProps(row)} />
      ))}
    </div>
  );
}
