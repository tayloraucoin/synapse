"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { IconValue } from "@syn/types";
import {
  Checkbox,
  cn,
  ConfirmDialog,
  DeleteIcon,
  EditIcon,
  IconAndColourIcon,
  InlineAddRow,
  Input,
  ItemIcon,
  RegionRetry,
  ResponsiveSheet,
  toast,
  toastUndo,
} from "@syn/ui";
import { instantToWallClockMinutes, weekdayIndex } from "@syn/utils";
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
  clockLabel,
  nowMark,
  spanLabel,
  SwipeRow,
  type BlockViewBody,
} from "@/components/planner/block-view";
import { IconPickerStep } from "@/components/planner/icon-picker-step";
import { isJournalItem, withJournalTick } from "@/lib/data/journal-row";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import { useBlockDayWrites } from "@/lib/data/use-block-day-writes";
import {
  inOrderOf,
  useBlockView,
  type BlockViewItem,
} from "@/lib/data/use-block-view";
import { useJournalWritten } from "@/lib/data/use-journal";
import { useTodayKey } from "@/lib/data/use-morning";
import { useToday } from "@/lib/data/use-today";
import { useTodayBlockLook } from "@/lib/data/use-today-block-look";
import { useNow as useMinute } from "@/lib/hooks/use-now";
import {
  itemSheetRoute,
  journalRoute,
  TODAY_BLOCK_FROM_PARAM,
  todayReviewRoute,
  todayRoute,
  todayScheduleRoute,
  withSearch,
} from "@/lib/routes";
import { useBlockViewFrom } from "../../../../_components/use-block-view-from";
import { BLOCK_DAY_COPY as COPY } from "./copy";

/**
 * Block view from the day (USE-48; day/block-view/): one block on today's
 * date as a child page, `BlockView` in its `"day"` mode. The header paints
 * from the day already read (`useToday`); only the rows wait, on the week's
 * read (`useBlockView`), so loading is the header live over skeleton rows.
 *
 * Every change is today's only (C-USE-block-view-4), through
 * `useBlockDayWrites`: a check writes the slot's done at the planned length
 * (D-USE-13) and the row stays in place, faded with its check; a swipe's
 * Remove skips the item on the date with Undo; Edit shows the grips and the
 * hint, a drop writes the date's order; the row's long-press menu has Move
 * up, Move down and Remove, the gestures' keyboard path; ··· opens "Today's
 * Wellness only": Rename and Icon and colour (kept on this device for the
 * date until the schema carries them [ASSUMPTION]) and Delete block, which
 * asks once, then returns to the day with Undo (D-USE-69).
 *
 * The now-line crosses the item under way only while the block is current
 * (D-USE-30). Past rows stay live: nothing says missed. Offline, one line
 * under the header; checks and edits save on the phone (D-USE-64).
 */

/** "swipe:<id>" from a scenario's `view.open`. */
function seeded(open: string | undefined, what: string): string | null {
  const prefix = `${what}:`;
  return open?.startsWith(prefix) ? open.slice(prefix.length) : null;
}

const HUES = new Set<string>(Object.values(BLOCK_HUE));

/** A picked icon's colour as the bar's hue, when it is one. */
function hueOfIcon(icon: IconValue | undefined): BlockHue | null {
  if (icon?.kind !== "curated" || icon.colorKey === null) return null;
  return HUES.has(icon.colorKey) ? (icon.colorKey as BlockHue) : null;
}

/** Edit's held drag: `itemId` drawn above `beforeId`, not written. */
function draggedOrder(
  items: readonly BlockViewItem[],
  drag: { itemId: string; beforeId: string },
): string[] {
  const ids = items.map((item) => item.id).filter((id) => id !== drag.itemId);
  const at = ids.indexOf(drag.beforeId);
  ids.splice(at === -1 ? ids.length : at, 0, drag.itemId);
  return ids;
}

const PLAIN_BUTTON = cn(
  "inline-flex min-h-(--target) min-w-(--target) items-center justify-center rounded-(--radius-control) px-(--space-2)",
  "text-(length:--fs-body) text-foreground outline-none",
  "focus-visible:ring-ring focus-visible:ring-2",
);

export function TodayBlockScreen({ blockId }: { blockId: string }) {
  const router = useRouter();
  const source = useDataSource();
  const view = source.scenario.view;
  const date = useTodayKey();
  const from = useBlockViewFrom();
  const offline = useIsOffline();
  // A render each minute, so the now-line moves and leaves at the block's end.
  useMinute();
  const nowMin = instantToWallClockMinutes(
    source.now(),
    source.scenario.records.timeZone,
  );

  const day = useToday(date);
  const occurrence =
    day.today?.occurrences.blocks.find((o) => o.block.id === blockId) ?? null;
  const rowsQuery = useBlockView({ blockId, date });
  const writes = useBlockDayWrites({ blockId, date });

  const drag = view?.drag ?? null;
  const [editing, setEditing] = React.useState(
    view?.open === "edit" || drag !== null,
  );
  const [swipeId, setSwipeId] = React.useState(seeded(view?.open, "swipe"));
  const [menuId, setMenuId] = React.useState(seeded(view?.open, "menu"));
  const [renaming, setRenaming] = React.useState(view?.open === "rename");
  const [picking, setPicking] = React.useState(view?.open === "icon");
  const [confirming, setConfirming] = React.useState(
    view?.open === "delete-confirm",
  );
  const [savingOrder, setSavingOrder] = React.useState<string[] | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  // Focus on open: the block's name, a level-1 heading.
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const rows = rowsQuery.view;
  const block = occurrence?.block ?? rows?.block.block ?? null;
  // The date's own look is already on the block (`readDay`, USE-88).
  const name = block?.name ?? "";
  const hue =
    hueOfIcon(block?.icon ?? undefined) ??
    (block ? BLOCK_HUE[block.kind] : "slate");
  const startsAt = occurrence?.startsAt ?? rows?.block.startsAt ?? null;
  const endsAt = occurrence?.endsAt ?? rows?.block.endsAt ?? null;
  const writeLook = useTodayBlockLook(
    startsAt !== null && endsAt !== null
      ? { blockId, date, startsAt, endsAt }
      : null,
  );

  // The crumb goes back where it came from (current.md [ASSUMPTION]).
  const back =
    from === "review"
      ? todayReviewRoute()
      : from === "schedule"
        ? todayScheduleRoute()
        : todayRoute();
  // `?state=` travels; `from` is this screen's own.
  const search = useSearchParams();
  const kept = (path: string) => {
    const query = new URLSearchParams(search.toString());
    query.delete(TODAY_BLOCK_FROM_PARAM);
    return withSearch(path, query.toString());
  };

  // A removed row's Undo, seeded for `?state=removed-undo`, held for the capture.
  const removedSeed = seeded(view?.open, "removed");
  const seededToast = React.useRef(false);
  React.useEffect(() => {
    if (removedSeed === null || seededToast.current || !rows) return;
    seededToast.current = true;
    const title =
      source.scenario.records.blockItems.find((i) => i.id === removedSeed)
        ?.title ?? "";
    toastUndo({
      text: COPY.removed(title),
      durationMs: Number.POSITIVE_INFINITY,
      onUndo: () => {
        const slot = source.scenario.records.slots.find(
          (s) => s.blockItemId === removedSeed && s.onDate === date,
        );
        if (slot) {
          void source.server
            .writeSlots({ id: slot.id, skipped: false })
            .then(() => rowsQuery.refetch());
        }
      },
    });
  }, [removedSeed, rows, source, date, rowsQuery]);

  const order =
    savingOrder ?? (drag && rows ? draggedOrder(rows.items, drag) : null);
  const shown = rows
    ? order
      ? inOrderOf(rows, order)
      : { items: rows.items, reflow: rows.reflow }
    : null;
  // The Journal row ticks itself while the journal holds an answer (USE-110).
  const journalWrittenToday = useJournalWritten(date);
  const items = withJournalTick(shown?.items ?? [], journalWrittenToday);

  /** The box shows at once; a failure puts it back and says so. */
  function check(item: BlockViewItem, done: boolean) {
    writes.check(item, done).catch(() => {
      setAnnouncement(COPY.notSaved(item.title));
      toast(COPY.notSaved(item.title));
    });
  }

  async function remove(item: BlockViewItem) {
    setSwipeId(null);
    const token = await writes.remove(item);
    setAnnouncement(COPY.removed(item.title));
    toastUndo({
      text: COPY.removed(item.title),
      onUndo: () => void writes.undo(token),
    });
  }

  function reorder(ids: string[], movedId: string | null) {
    setSavingOrder(ids);
    void writes.reorder(ids).finally(() => setSavingOrder(null));
    if (!rows || movedId === null) return;
    const moved = inOrderOf(rows, ids).items.find((i) => i.id === movedId);
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
    // Move up / Move down trade places with the neighbour, checked rows too
    // (D-USE-69: every row keeps its grip in Edit).
    const ids = items.map((row) => row.id);
    const from = ids.indexOf(item.id);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to] as string, item.id];
    reorder(ids, item.id);
  }

  function openItemSheet(item: BlockViewItem, swap: boolean) {
    const here = `${window.location.pathname}${window.location.search}`;
    router.push(itemSheetRoute(here, item.id, swap ? "swap" : undefined), {
      scroll: false,
    });
  }

  async function deleteBlock() {
    setConfirming(false);
    const token = await writes.deleteBlock();
    router.push(kept(back));
    toastUndo({
      text: COPY.deleted(name),
      onUndo: () => void writes.undo(token),
    });
  }

  const menuRows: NowBlockMenuRow[] = [
    { label: COPY.rename, icon: EditIcon, onSelect: () => setRenaming(true) },
    {
      label: COPY.iconAndColour,
      icon: IconAndColourIcon,
      // The block's own icon in its colour; the dashed circle only when unset.
      glyph: block?.icon ? (
        <ItemIcon icon={block.icon} size={20} className="size-4" />
      ) : undefined,
      onSelect: () => setPicking(true),
    },
    {
      label: COPY.deleteBlock,
      icon: DeleteIcon,
      onSelect: () => setConfirming(true),
      separated: true,
    },
  ];

  const actions = (
    <>
      <button
        type="button"
        aria-pressed={editing}
        className={cn(PLAIN_BUTTON, editing ? "font-semibold" : "font-medium")}
        onClick={() => {
          setEditing((on) => !on);
          setSwipeId(null);
        }}
      >
        {editing ? COPY.done : COPY.edit}
      </button>
      {/* Hidden while editing (edit-dragging.md). */}
      {editing ? null : (
        <NowBlockMenu
          label={COPY.more(name)}
          title={COPY.menuTitle(name)}
          rows={menuRows}
          defaultOpen={view?.open === "header-menu"}
        />
      )}
    </>
  );

  const titleField = renaming ? (
    <RenameField
      name={name}
      onDone={(next) => {
        setRenaming(false);
        if (next !== null && next !== name) void writeLook({ name: next });
      }}
    />
  ) : null;

  const reflow = shown?.reflow ?? null;
  const body: BlockViewBody<BlockViewItem> = rowsQuery.isError
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
    : !rows || !reflow || startsAt === null || endsAt === null
      ? { state: "loading", label: COPY.loading(name) }
      : {
          state: "ready",
          column: {
            rows: items,
            label: name,
            block: { startsAt, endsAt },
            reorder: editing
              ? { onReorder: onDrop, frozenId: drag?.itemId ?? null }
              : null,
            leading: (row) => (
              <label
                data-no-swipe
                className="-mx-3 flex size-(--target) shrink-0 items-center justify-center"
              >
                <Checkbox
                  checked={row.done}
                  onCheckedChange={(next) => check(row, next === true)}
                  aria-label={BLOCK_VIEW_COPY.checkbox(
                    row.title,
                    clockLabel(row.startsAt),
                    row.lengthMin === null
                      ? ""
                      : BLOCK_VIEW_COPY.length(row.lengthMin),
                  )}
                  className="data-[state=checked]:border-text-muted data-[state=checked]:bg-text-muted"
                />
              </label>
            ),
            title: (row) => (
              <button
                type="button"
                data-row-open
                onClick={() =>
                  // The Journal row opens Close the day, never the Item sheet.
                  isJournalItem(row.title)
                    ? router.push(journalRoute(date))
                    : openItemSheet(row, false)
                }
                className="max-w-full truncate rounded-(--radius-control) text-start text-(length:--fs-body) outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {row.title}
              </button>
            ),
            wrapRow: (row, body) => {
              const index = items.indexOf(row);
              return (
                <SwipeRow
                  open={swipeId === row.id}
                  onOpenChange={(open) => setSwipeId(open ? row.id : null)}
                  removeLabel={COPY.remove}
                  removeName={COPY.removeName(row.title)}
                  onRemove={() => void remove(row)}
                >
                  <RowMenu
                    clone={body}
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
                    onOpenChange={(open) => setMenuId(open ? row.id : null)}
                    canMoveUp={index > 0}
                    canMoveDown={index < items.length - 1}
                    onSwap={() => openItemSheet(row, true)}
                    onEdit={() => openItemSheet(row, false)}
                    onMoveUp={() => move(row, -1)}
                    onMoveDown={() => move(row, 1)}
                    onNotToday={() => void remove(row)}
                  >
                    {body}
                  </RowMenu>
                </SwipeRow>
              );
            },
            now: nowMark({ startsAt, endsAt }, items, nowMin),
            empty: (
              <p className="text-text-muted text-(length:--fs-body)">
                {COPY.empty(name)}
              </p>
            ),
            add: {
              at: reflow.freeFrom,
              node: (
                <InlineAddRow
                  label={COPY.addTo(name)}
                  placeholder={COPY.addPlaceholder}
                  maxLength={120}
                  keepOpen
                  onSubmit={(title) => void writes.add(title, items)}
                />
              ),
            },
            freeFrom: reflow.freeFrom,
            overMin: reflow.overMin,
            peek: peekOf(day.today, endsAt),
          },
        };

  // The confirm names the usual weekday that keeps the block.
  const weekday = COPY.weekdays[weekdayIndex(date)] ?? "";

  return (
    <>
      <BlockView
        mode="day"
        crumb={{
          label: COPY.today,
          href: kept(back),
          ariaLabel: COPY.backTo(COPY.today),
        }}
        name={name}
        meta={startsAt && endsAt ? spanLabel(startsAt, endsAt) : ""}
        hue={hue}
        headingRef={headingRef}
        titleField={titleField}
        actions={actions}
        status={offline ? <OfflineLine text={COPY.offline} /> : null}
        scope={editing ? COPY.hint : null}
        body={body}
      >
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </BlockView>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={COPY.deleteTitle(name)}
        description={COPY.deleteBody(name, weekday)}
        confirmLabel={COPY.deleteConfirm}
        cancelLabel={COPY.keep}
        onConfirm={() => void deleteBlock()}
      />

      <ResponsiveSheet
        open={picking}
        onOpenChange={setPicking}
        title={COPY.iconAndColour}
        headerAction={null}
        size="tall"
      >
        <IconPickerStep
          name={name}
          value={block?.icon ?? null}
          backLabel={name}
          onBack={() => setPicking(false)}
          onPick={(icon) => {
            void writeLook({ icon });
            setPicking(false);
          }}
          onRecolour={(icon) => void writeLook({ icon })}
        />
      </ResponsiveSheet>
    </>
  );
}

/** The next block that starts at or after this one's end: the peek. */
function peekOf(
  today: ReturnType<typeof useToday>["today"],
  endsAt: string,
): { name: string; span: string; hue: BlockHue } | null {
  const next = today?.occurrences.blocks.find((o) => o.startsAt >= endsAt);
  if (!next) return null;
  return {
    name: next.block.name,
    span: spanLabel(next.startsAt, next.endsAt),
    hue: BLOCK_HUE[next.block.kind],
  };
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
