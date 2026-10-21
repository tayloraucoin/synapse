"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BlockFill, IconValue } from "@syn/types";
import {
  Button,
  cn,
  EditIcon,
  IconAndColourIcon,
  Input,
  ItemIcon,
  NotTodayIcon,
  RegionRetry,
  ResponsiveSheet,
  SetTimeIcon,
  Text,
  TimeField,
  toast,
  toastUndo,
} from "@syn/ui";
import {
  clockFromMinutes,
  clockToMinutes,
  formatMinutesShort,
  weekdayIndex,
  weekKeyOf,
} from "@syn/utils";
import {
  NowBlockMenu,
  OfflineLine,
  RowMenu,
  type NowBlockMenuRow,
} from "@/components/planner";
import { BLOCK_HUE, type BlockHue } from "@/components/planner/block-hue";
import {
  BLOCK_VIEW_COPY,
  BlockView,
  BlockViewColumn,
  clockLabel,
  EditingAddRow,
  KindSelectRow,
  KindSwitchRow,
  MealTopicOffers,
  rowHeightPx,
  SetTimeMark,
  spanLabel,
  SpanTotal,
  SuggestedList,
  SwipeRow,
  type BlockViewBody,
  type SuggestedListRow,
} from "@/components/planner/block-view";
import { IconPickerStep } from "@/components/planner/icon-picker-step";
import { KIND_WORDS } from "@/components/planner/new-block-sheet/form";
import {
  blockEditMeta,
  isDated,
  isTimeless,
  scopeWords,
  spanTotal,
  stretchesRows,
  suggestionsFor,
  type BlockEditPlace,
} from "@/lib/data/block-edit";
import { reachWords, weekdayName } from "@/lib/data/set-up-view";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import { useBlockEditWrites } from "@/lib/data/use-block-edit-writes";
import {
  inOrderOf,
  inTimeOrder,
  useBlockView,
  type BlockView as BlockViewData,
  type BlockViewItem,
} from "@/lib/data/use-block-view";
import { useMealLeftOut } from "@/lib/data/use-meal-left-out";
import { useMealTopics } from "@/lib/data/use-meal-topics";
import { useTodayBlockLook } from "@/lib/data/use-today-block-look";
import { useWeekQuery } from "@/lib/data/use-week";
import {
  DAYS_BLOCK_PARAMS,
  DAYS_BLOCK_WEEKDAYS,
  daysRoute,
  itemSheetRoute,
  mealTopicsSheetRoute,
  withSearch,
} from "@/lib/routes";
import { BLOCK_EDIT_COPY as COPY } from "./copy";
import { useTodosEditing } from "./todos-editing";
import { useWorkTiersEditing } from "./work-tiers-editing";

/**
 * Block view in editing (USE-49; day/block-view/by-kind.md): one block
 * opened from Set my days, `BlockView` in its `"editing"` mode. The usual
 * weekday's block (`?weekday=mon`): every change is every such weekday's,
 * its reach named once as Set my days names it (D-USE-33). This week's date
 * (`?date=`): every change is that date's only (C-USE-block-view-kind-3).
 *
 * No checkboxes; a grip on every row but a set-time one, which shows a
 * clock and "At 7:10 · 10 min" and keeps its time and place while the rest
 * re-flow (round 8, C-USE-block-view-kind-1); swipe left removes with Undo;
 * the add row types a 5 minute item after the last (D-USE-81), its dashed
 * square picking the icon. Done and the crumb go back to Set my days.
 *
 * The kinds compose the one view through its slots (the dev's call): a
 * header row (Meal, Training for, Work fills it with, Checklist, no times),
 * the rows' leading icon and trailing Swap or set-time mark, and what sits
 * under the add row (the meal's topics, Life's and Set work's line, Set a
 * time). Offline every edit saves on the phone and syncs later (D-USE-67):
 * one line under the header, no control faded.
 */

/** "add", "header-menu", "left-out:<id>,<id>" from a scenario's `view.open`. */
function seeded(open: string | undefined, what: string): string | null {
  const prefix = `${what}:`;
  return open?.startsWith(prefix) ? open.slice(prefix.length) : null;
}

/** `?weekday=mon` or `?date=`; a bare path is the usual Monday. */
function placeOf(search: URLSearchParams): BlockEditPlace {
  const date = search.get(DAYS_BLOCK_PARAMS.date);
  if (date) return { date };
  const key = search.get(DAYS_BLOCK_PARAMS.weekday);
  const weekday = DAYS_BLOCK_WEEKDAYS.findIndex((day) => day === key);
  return { weekday: weekday === -1 ? 0 : weekday };
}

const HUES = new Set<string>(Object.values(BLOCK_HUE));

function hueOf(icon: IconValue | null | undefined, kind: string): BlockHue {
  if (
    icon?.kind === "curated" &&
    icon.colorKey !== null &&
    HUES.has(icon.colorKey)
  ) {
    return icon.colorKey as BlockHue;
  }
  return BLOCK_HUE[kind as keyof typeof BLOCK_HUE] ?? "slate";
}

const PLAIN_BUTTON = cn(
  "inline-flex min-h-(--target) min-w-(--target) items-center justify-center rounded-(--radius-control) px-(--space-2)",
  "text-(length:--fs-body) text-foreground font-semibold outline-none",
  "focus-visible:ring-ring focus-visible:ring-2",
);

export function DaysBlockScreen({
  blockId,
  at,
}: {
  blockId: string;
  /** The place's query ("date=2026-10-17"), for a part on `/dev/parts`. */
  at?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const search = at === undefined ? params : new URLSearchParams(at);
  const source = useDataSource();
  const view = source.scenario.view;
  const offline = useIsOffline();
  const place = placeOf(search);
  const dated = isDated(place);
  const weekday = dated ? weekdayIndex(place.date) : place.weekday;
  const dayName = weekdayName(weekday);

  const rowsQuery = useBlockView({ blockId, ...place, transitions: true });
  // USE-156: the kind's suggestions, read from the same week.
  const suggestions =
    useWeekQuery(dated ? weekKeyOf(place.date) : "usual", (records) =>
      suggestionsFor(records, blockId, weekday),
    ).data ?? null;
  const writes = useBlockEditWrites(blockId, place);
  const topics = useMealTopics();
  const [leftOut, toggleTopic] = useMealLeftOut(
    blockId,
    weekday,
    seeded(view?.open, "left-out")?.split(",") ?? [],
  );

  const [swipeId, setSwipeId] = React.useState<string | null>(null);
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [renaming, setRenaming] = React.useState(false);
  const [picking, setPicking] = React.useState<"block" | "add" | null>(null);
  const [addIcon, setAddIcon] = React.useState<IconValue | null>(null);
  const [settingTime, setSettingTime] = React.useState(
    view?.open === "set-a-time",
  );
  const [savingOrder, setSavingOrder] = React.useState<string[] | null>(null);
  // "Add one" opens the add row again; a new key mounts it open.
  const [addOpened, setAddOpened] = React.useState(0);
  // `?state=suggested-reorder`: a row held mid-drag, as edit-dragging.md.
  const liftedId = seeded(view?.open, "lifted");
  const [announcement, setAnnouncement] = React.useState("");
  const reachShown = React.useRef(false);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    if (view?.open === "add") return;
    headingRef.current?.focus({ preventScroll: true });
  }, [view?.open]);

  const data = rowsQuery.view ?? null;
  const record = data?.block.block ?? null;
  const kind = record?.kind ?? "wellness";
  // A date's own look is already on the block (`readDay`, USE-88).
  const name = record?.name ?? "";
  const startsAt = data?.block.startsAt ?? null;
  const endsAt = data?.block.endsAt ?? null;
  const writeLook = useTodayBlockLook(
    dated && startsAt !== null && endsAt !== null
      ? { blockId, date: place.date, startsAt, endsAt }
      : null,
  );
  const timeless =
    startsAt !== null && endsAt !== null && isTimeless({ startsAt, endsAt });
  // This week's crumb is dated, as its chips are: "‹ Mon 12" (work-tiers.md).
  const crumbLabel = dated
    ? `${dayName.slice(0, 3)} ${Number(place.date.slice(8, 10))}`
    : dayName;
  // A Work block on This week is "this Monday only" (work-tiers.md).
  const scope =
    scopeWords(place, weekday) + (dated && kind === "work" ? " only" : "");

  // USE-50: a This week Work block on its tiers; a To-dos block's to-dos.
  const work = useWorkTiersEditing({
    data,
    dateKey: dated ? place.date : null,
    open: view?.open,
    announce: setAnnouncement,
  });
  const todos = useTodosEditing({
    data,
    dateKey: dated ? place.date : null,
    open: view?.open,
    addIcon,
    onPickIcon: () => setPicking("add"),
    clearAddIcon: () => setAddIcon(null),
    announce: setAnnouncement,
  });

  // `?state=` travels back to Set my days; the place is this screen's own.
  const kept = new URLSearchParams(search.toString());
  kept.delete(DAYS_BLOCK_PARAMS.weekday);
  kept.delete(DAYS_BLOCK_PARAMS.date);
  const back = withSearch(
    dated
      ? daysRoute({ week: weekKeyOf(place.date), day: place.date })
      : daysRoute({ week: "usual", day: weekday }),
    kept.toString(),
  );

  /** A usual change names its reach once a visit (D-USE-33) [ASSUMPTION]. */
  function named(write: Awaited<ReturnType<typeof writes.reorder>>) {
    if (dated || reachShown.current || !write.reach) return;
    reachShown.current = true;
    toast(
      reachWords({
        blockName: name,
        weekday: write.reach.weekday,
        follows: write.reach.follows,
      }),
    );
  }

  const order = savingOrder;
  const shown = data
    ? order
      ? inOrderOf(data, order)
      : { items: data.items, reflow: data.reflow }
    : null;
  const items = shown ? inTimeOrder(shown.items) : [];

  async function remove(item: BlockViewItem) {
    setSwipeId(null);
    const write = await writes.remove(item);
    const words = COPY.removed(item.title, dated ? scope : `from ${scope}`);
    setAnnouncement(words);
    toastUndo({ text: words, onUndo: () => void writes.undo(write.undo) });
  }

  function reorder(ids: string[], movedId: string | null) {
    setSavingOrder(ids);
    void writes
      .reorder(ids)
      .then(named)
      .finally(() => setSavingOrder(null));
    if (!data || movedId === null) return;
    const moved = inOrderOf(data, ids).items.find((i) => i.id === movedId);
    if (moved) {
      setAnnouncement(COPY.moved(moved.title, clockLabel(moved.startsAt)));
    }
  }

  /** A drop: the one row whose leaving makes both orders agree moved. */
  function onDrop(ids: string[]) {
    const before = items.map((item) => item.id);
    const without = (list: readonly string[], id: string) =>
      list.filter((other) => other !== id).join(" ");
    const movedId =
      ids.find(
        (id, index) =>
          before[index] !== id && without(before, id) === without(ids, id),
      ) ?? null;
    reorder(ids, movedId);
  }

  function move(item: BlockViewItem, direction: -1 | 1) {
    const ids = items.map((row) => row.id);
    const from = ids.indexOf(item.id);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to] as string, item.id];
    reorder(ids, item.id);
  }

  function add(title: string) {
    const icon = addIcon;
    setAddIcon(null);
    setAnnouncement(COPY.added(title));
    void writes
      .add(title, data?.items ?? [], icon, timeless ? null : 5)
      .then(named)
      .catch(() => {});
  }

  /**
   * A suggestion's +: one item at the end with its title, icon and length.
   * No toast, the reach's included: the row is the proof (D-USE-135).
   */
  function addSuggested(row: SuggestedListRow) {
    setAnnouncement(COPY.added(row.title));
    void writes
      .add(row.title, data?.items ?? [], row.icon, row.lengthMin)
      .catch(() => {});
  }

  function editBlock(patch: Parameters<typeof writes.editBlock>[0]) {
    void writes
      .editBlock(patch)
      .then(named)
      .catch(() => {});
  }

  function openItemSheet(item: BlockViewItem, swap: boolean) {
    const here = `${window.location.pathname}${window.location.search}`;
    router.push(itemSheetRoute(here, item.id, swap ? "swap" : undefined), {
      scroll: false,
    });
  }

  async function notThisWeek() {
    if (!dated) return;
    const write = await writes.notThisWeek(place.date);
    router.push(back);
    toastUndo({
      text: COPY.freed(name, dayName),
      onUndo: () => void writes.undo(write.undo),
    });
  }

  const menuRows: NowBlockMenuRow[] = [
    { label: COPY.rename, icon: EditIcon, onSelect: () => setRenaming(true) },
    {
      label: COPY.iconAndColour,
      icon: IconAndColourIcon,
      // The block's own icon in its colour; the dashed circle only when unset.
      glyph: record?.icon ? (
        <ItemIcon icon={record.icon} size={20} className="size-4" />
      ) : undefined,
      onSelect: () => setPicking("block"),
    },
    // D-USE-87: Not this week, a row in the block's ··· from This week.
    ...(dated && kind === "life"
      ? [
          {
            label: COPY.notThisWeek,
            icon: NotTodayIcon,
            onSelect: () => void notThisWeek(),
            separated: true,
          },
        ]
      : []),
  ];

  const actions = (
    <>
      <button
        type="button"
        className={PLAIN_BUTTON}
        onClick={() => router.push(back)}
      >
        {COPY.done}
      </button>
      <NowBlockMenu
        label={COPY.more(name)}
        title={COPY.menuTitle(
          dated ? `This ${dayName}` : `Every ${dayName}`,
          name,
        )}
        rows={menuRows}
        defaultOpen={view?.open === "header-menu"}
      />
    </>
  );

  /** A name or icon: the usual block's own, or the date's change (USE-88). */
  function setLookOrBlock(next: { name?: string; icon?: IconValue }) {
    if (dated) void writeLook(next);
    else editBlock(next);
  }

  const titleField = renaming ? (
    <RenameField
      name={name}
      onDone={(next) => {
        setRenaming(false);
        if (next !== null && next !== name) setLookOrBlock({ name: next });
      }}
    />
  ) : null;

  // The kinds' header rows: the usual block's own settings, so a date shows none.
  const kindRows =
    !record || dated ? null : timeless ? (
      <KindSwitchRow
        label={BLOCK_VIEW_COPY.editing.checklist}
        state={BLOCK_VIEW_COPY.editing.on}
        checked
        // Off asks for a span, as Set a time (checklist-editing.md [ASSUMPTION]).
        onCheckedChange={(on) => {
          if (!on) setSettingTime(true);
        }}
      />
    ) : kind === "break" ? (
      <KindSwitchRow
        meal
        label={BLOCK_VIEW_COPY.editing.meal}
        state={
          record.meal
            ? BLOCK_VIEW_COPY.editing.mealOn
            : BLOCK_VIEW_COPY.editing.off
        }
        checked={record.meal}
        onCheckedChange={(meal) => editBlock({ meal })}
      />
    ) : kind === "training" ? (
      // Body fitness only until the dev note's pass (training-for.md).
      <KindSelectRow
        label={BLOCK_VIEW_COPY.editing.trainingFor}
        value="body-fitness"
        options={[
          { value: "body-fitness", label: BLOCK_VIEW_COPY.editing.bodyFitness },
        ]}
        onChange={() => {}}
      />
    ) : kind === "work" && record.fill === "set_items" ? (
      <KindSelectRow<BlockFill>
        label={BLOCK_VIEW_COPY.editing.fillsWith}
        value="set_items"
        options={[
          { value: "set_items", label: BLOCK_VIEW_COPY.editing.setWork },
          {
            value: "tasks_for_the_day",
            label: BLOCK_VIEW_COPY.editing.tasksForTheDay,
          },
        ]}
        onChange={(fill) => editBlock({ fill })}
      />
    ) : null;

  const trueBreak = kind === "break" && record?.meal === false;
  const isNew = items.length === 0 && !trueBreak;

  const afterAdd = !record ? null : kind === "break" && record.meal ? (
    <MealTopicOffers
      meal={name}
      topics={topics.query.data ?? []}
      leftOut={leftOut}
      onToggle={toggleTopic}
      onEditTopics={() =>
        router.push(
          mealTopicsSheetRoute(
            `${window.location.pathname}${window.location.search}`,
          ),
          { scroll: false },
        )
      }
    />
  ) : kind === "life" ? (
    <Caption>{COPY.lifeLine(dayName)}</Caption>
  ) : kind === "work" && record.fill === "set_items" ? (
    <Caption>{COPY.setWorkLine(dayName)}</Caption>
  ) : timeless ? (
    <div className="flex flex-col items-start gap-(--space-3) pt-(--space-2)">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setSettingTime(true)}
      >
        <SetTimeIcon aria-hidden="true" className="size-4" />
        {BLOCK_VIEW_COPY.editing.setATime}
      </Button>
      <Caption>{COPY.checklistLine}</Caption>
    </div>
  ) : null;

  const reflow = shown?.reflow ?? null;
  const listed = suggestions !== null && !timeless;
  const total =
    listed && startsAt !== null && endsAt !== null
      ? spanTotal({ startsAt, endsAt }, items)
      : null;
  const flat = !stretchesRows(kind) || timeless;
  const body: BlockViewBody<BlockViewItem> =
    !rowsQuery.isError && work
      ? { state: "node", node: work.node }
      : !rowsQuery.isError &&
          todos &&
          data &&
          startsAt !== null &&
          endsAt !== null
        ? {
            state: "node",
            node: (
              <BlockViewColumn
                {...todos.column}
                label={name}
                block={{ startsAt, endsAt }}
                peek={peekOf(data, endsAt)}
              />
            ),
          }
        : rowsQuery.isError
          ? {
              state: "error",
              retry: (
                <RegionRetry
                  label={COPY.failed(name)}
                  detail={COPY.failedDetail}
                  onRetry={() => void rowsQuery.retry()}
                  className="py-(--space-6)"
                />
              ),
            }
          : !data || !reflow || startsAt === null || endsAt === null
            ? { state: "loading", label: COPY.loading(name) }
            : {
                state: "ready",
                column: {
                  rows: items,
                  label: name,
                  block: { startsAt, endsAt },
                  timeless,
                  rowHeight: (row) => (flat ? 56 : rowHeightPx(row.lengthMin)),
                  reorder: { onReorder: onDrop, frozenId: liftedId },
                  leading: (row) => (
                    <ItemIcon icon={row.icon} size={24} className="shrink-0" />
                  ),
                  title: (row) => (
                    <button
                      type="button"
                      data-row-open
                      onClick={() => openItemSheet(row, false)}
                      className={cn(
                        "max-w-full truncate rounded-(--radius-control) text-start text-(length:--fs-body) outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        // A transition in the flow: italic, muted (training-editing.md).
                        row.isTransition && "text-text-muted italic",
                      )}
                    >
                      {row.title}
                    </button>
                  ),
                  trailing: (row, slots) => {
                    const length = timeless ? null : slots.length;
                    const swap =
                      kind === "training" && !row.isTransition ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          data-no-swipe
                          onClick={() => openItemSheet(row, true)}
                          className="h-8 shrink-0 px-(--space-2)"
                        >
                          {BLOCK_VIEW_COPY.editing.swap}
                        </Button>
                      ) : null;
                    // Round 8: a set item (not a drive) shows its clock, never a grip.
                    if (row.atTime !== null && !row.isTransition && !timeless) {
                      return (
                        <>
                          {swap}
                          <SetTimeMark atTime={row.atTime} length={length} />
                        </>
                      );
                    }
                    return (
                      <>
                        {swap}
                        {length === null ? null : (
                          <span className="text-text-muted shrink-0 text-(length:--fs-caption) leading-(--lh-caption) tabular-nums">
                            {row.lengthMin === null
                              ? length
                              : formatMinutesShort(row.lengthMin)}
                          </span>
                        )}
                        {slots.grip}
                      </>
                    );
                  },
                  wrapRow: (row, rowBody) => {
                    const index = items.indexOf(row);
                    return (
                      <SwipeRow
                        open={swipeId === row.id}
                        onOpenChange={(open) =>
                          setSwipeId(open ? row.id : null)
                        }
                        removeLabel={COPY.remove}
                        removeName={COPY.removeName(row.title)}
                        onRemove={() => void remove(row)}
                      >
                        <RowMenu
                          clone={rowBody}
                          words={{
                            swap: COPY.row.swap,
                            edit: COPY.row.edit,
                            moveUp: COPY.row.moveUp,
                            moveDown: COPY.row.moveDown,
                            notToday: COPY.row.notToday,
                            more: COPY.row.more(row.title),
                            menu: COPY.row.menu(row.title),
                          }}
                          open={menuId === row.id}
                          onOpenChange={(open) =>
                            setMenuId(open ? row.id : null)
                          }
                          canMoveUp={index > 0}
                          canMoveDown={index < items.length - 1}
                          onSwap={() => openItemSheet(row, true)}
                          onEdit={() => openItemSheet(row, false)}
                          onMoveUp={() => move(row, -1)}
                          onMoveDown={() => move(row, 1)}
                          onNotToday={() => void remove(row)}
                        >
                          {rowBody}
                        </RowMenu>
                      </SwipeRow>
                    );
                  },
                  empty: trueBreak ? (
                    <div className="flex flex-col gap-(--space-1)">
                      <Text as="p" variant="body">
                        {COPY.trueBreak(name)}
                      </Text>
                      <Caption>{COPY.trueBreakLine}</Caption>
                    </div>
                  ) : listed ? null : (
                    // With the list, the total says it: "Nothing in Wellness yet".
                    <Text as="p" variant="body">
                      {COPY.empty(name)}
                    </Text>
                  ),
                  add: {
                    // Past the span there is no free time; the row sits where the last ends.
                    at:
                      items.length === 0
                        ? startsAt
                        : (reflow.freeFrom ?? endOfRows(items)),
                    node: (
                      <EditingAddRow
                        label={
                          timeless ? COPY.addToChecklist : COPY.addTo(name)
                        }
                        length={timeless ? null : BLOCK_VIEW_COPY.length(5)}
                        onSubmit={add}
                        icon={addIcon}
                        onPickIcon={() => setPicking("add")}
                        key={addOpened}
                        // A new block opens on its suggestions, the keyboard down (D-USE-135).
                        autoOpen={
                          (isNew && !listed) ||
                          view?.open === "add" ||
                          addOpened > 0
                        }
                        hint={
                          isNew && !listed
                            ? BLOCK_VIEW_COPY.editing.addHint
                            : null
                        }
                      />
                    ),
                  },
                  afterAdd,
                  suggestions:
                    listed && suggestions ? (
                      <SuggestedList
                        usedBefore={suggestions.usedBefore}
                        seed={suggestions.seed}
                        kind={
                          KIND_WORDS[kind as keyof typeof KIND_WORDS] ?? name
                        }
                        hue={hueOf(record?.icon, kind)}
                        onAdd={addSuggested}
                        onAddOne={() => setAddOpened((n) => n + 1)}
                      />
                    ) : null,
                  freeFrom: reflow.freeFrom,
                  overMin: reflow.overMin,
                  peek: peekOf(data, endsAt),
                },
              };

  return (
    <>
      <BlockView
        mode="editing"
        crumb={{
          label: crumbLabel,
          href: back,
          ariaLabel: COPY.backTo(crumbLabel),
          ...(timeless ? { current: COPY.checklist } : {}),
        }}
        name={name}
        meta={
          record && startsAt && endsAt
            ? blockEditMeta({ kind, name, startsAt, endsAt, scope })
            : ""
        }
        hue={hueOf(record?.icon, kind)}
        headingRef={headingRef}
        titleField={titleField}
        actions={actions}
        total={
          total && endsAt !== null ? (
            <SpanTotal
              block={name}
              {...total}
              end={clockLabel(endsAt)}
              hue={hueOf(record?.icon, kind)}
            />
          ) : null
        }
        scope={
          liftedId !== null ? BLOCK_VIEW_COPY.suggested.reorderHint : null
        }
        status={offline ? <OfflineLine text={COPY.offline} /> : null}
        kindRows={kindRows}
        body={body}
      >
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
        {work?.sheets}
        {todos?.sheets}
      </BlockView>

      <ResponsiveSheet
        open={picking !== null}
        onOpenChange={(open) => {
          if (!open) setPicking(null);
        }}
        title={COPY.iconAndColour}
        headerAction={null}
        size="tall"
      >
        <IconPickerStep
          name={picking === "add" ? COPY.addTo(name) : name}
          value={picking === "add" ? addIcon : (record?.icon ?? null)}
          backLabel={name}
          onBack={() => setPicking(null)}
          onPick={(icon) => {
            if (picking === "add") setAddIcon(icon);
            else setLookOrBlock({ icon });
            setPicking(null);
          }}
          onRecolour={(icon) => {
            if (picking === "add") setAddIcon(icon);
            else setLookOrBlock({ icon });
          }}
        />
      </ResponsiveSheet>

      <SetATimeSheet
        open={settingTime}
        onOpenChange={setSettingTime}
        onSave={(span) => {
          setSettingTime(false);
          editBlock(span);
        }}
      />
    </>
  );
}

/** "HH:MM" where the last row ends: the add row's rail past the span. */
function endOfRows(rows: readonly BlockViewItem[]): string | null {
  const ends = rows.map(
    (row) => clockToMinutes(row.startsAt) + (row.lengthMin ?? 0),
  );
  return ends.length === 0 ? null : clockFromMinutes(Math.max(...ends));
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <Text as="p" variant="caption" tone="muted">
      {children}
    </Text>
  );
}

/** The next block that starts at or after this one's end, else the stand-in. */
function peekOf(
  data: BlockViewData,
  endsAt: string,
): { name: string; span: string; hue: BlockHue } | null {
  if (isTimeless(data.block)) return null;
  const next = data.day.blocks.find(
    (b) => b.startsAt >= endsAt && !isTimeless(b),
  );
  if (!next) return { name: COPY.nothingAfter, span: "", hue: "slate" };
  return {
    name: next.block.name,
    span: spanLabel(next.startsAt, next.endsAt),
    hue: hueOf(next.block.icon, next.block.kind),
  };
}

/**
 * Set a time (checklist-editing.md, D-USE-28): Starts and Ends, as the New
 * block sheet's checklist asks them [ASSUMPTION]; the block gains a span and
 * its rows the rail, every box kept.
 */
function SetATimeSheet({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (span: { startsAt: string; endsAt: string }) => void;
}) {
  const [startsAt, setStartsAt] = React.useState("09:00");
  const [endsAt, setEndsAt] = React.useState("10:00");
  const invalid = endsAt <= startsAt;
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.setTime.title}
      headerAction={null}
    >
      <div className="flex flex-col gap-(--space-4) p-(--space-4)">
        <TimeField
          label={COPY.setTime.starts}
          value={startsAt}
          onChange={setStartsAt}
        />
        <TimeField
          label={COPY.setTime.ends}
          value={endsAt}
          onChange={setEndsAt}
          error={invalid ? COPY.setTime.endsAfter : undefined}
        />
        <Button disabled={invalid} onClick={() => onSave({ startsAt, endsAt })}>
          {COPY.setTime.save}
        </Button>
      </div>
    </ResponsiveSheet>
  );
}

/** Rename: the header's name as a field in place; Return saves, Escape keeps. */
function RenameField({
  name,
  onDone,
}: {
  name: string;
  onDone: (next: string | null) => void;
}) {
  const [value, setValue] = React.useState(name);
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    ref.current?.select();
  }, []);
  return (
    <Input
      ref={ref}
      aria-label={COPY.renameLabel}
      value={value}
      maxLength={120}
      autoFocus
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => onDone(value.trim() || null)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onDone(value.trim() || null);
        if (event.key === "Escape") onDone(null);
      }}
      className="text-(length:--fs-title) font-semibold"
    />
  );
}
