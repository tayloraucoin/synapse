"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BreakIcon, MealIcon, ReorderIcon, toastUndo } from "@syn/ui";
import { nextItem } from "@syn/utils";
import {
  BlockDoneFooter,
  ChecklistRows,
  DayBlockHeader,
  NowBlockMenu,
  PlannerItemRow,
  RowMenu,
  SortableItemRows,
} from "@/components/planner";
import { isTimedDone, useRunningView } from "@/lib/data/running";
import { useDataSource } from "@/lib/data/source";
import {
  moveIds,
  useChecklistAdd,
  useChosenItem,
  useNow,
  useSlotWrites,
  type NowBlockView,
  type NowItemView,
} from "@/lib/data/use-now";
import { useBlockFocus } from "@/lib/data/use-block-focus";
import type { NowFooter } from "@/lib/data/now-end";
import {
  itemSheetRoute,
  todayBlockRoute,
  todayScheduleRoute,
} from "@/lib/routes";
import { BeforeGoList } from "./before-go-list";
import { EndBreakFooter } from "./end-break-footer";
import { NowEmpty } from "./now-empty";
import { nowBlockMenuRows } from "./block-menu";
import { NOW_COPY as COPY, TOOK_LINE_MS } from "./copy";
import { NowCurrentCard } from "./now-current-card";
import { NowTodosTray } from "./now-todos-tray";
import { TimeTakenSheet } from "./time-taken-sheet";
import { TimedTook } from "./timed-took";
import { TookLine } from "./took-line";

/** `view.open` from a scenario: "<what>:<item id>". */
function seeded(open: string | undefined, what: string): string | null {
  const prefix = `${what}:`;
  return open?.startsWith(prefix) ? open.slice(prefix.length) : null;
}

/** The rows in `ids`' order; a row `ids` does not name keeps its place. */
function inOrder(items: NowItemView[], ids: readonly string[] | null) {
  if (ids === null) return items;
  const rank = new Map(ids.map((id, index) => [id, index]));
  return [...items].sort(
    (a, b) =>
      (rank.get(a.id) ?? items.indexOf(a)) -
      (rank.get(b.id) ?? items.indexOf(b)),
  );
}

/** `?state=reordering`: the dragged row held above the row it lands on. */
function heldOrder(
  items: NowItemView[],
  drag: { itemId: string; beforeId: string },
): string[] {
  const ids = items.map((item) => item.id).filter((id) => id !== drag.itemId);
  ids.splice(Math.max(ids.indexOf(drag.beforeId), 0), 0, drag.itemId);
  return ids;
}

/**
 * Now (USE-16; day/now): the active block only, its current item lifted.
 * Everything it shows comes from `useNow`; the screen keeps only what the
 * person did here: the row made current, the "Took · Change" line, the
 * sheet. A scenario's `view` seeds those once, for a capture.
 *
 * The block's form is `useNow`'s (USE-17): a block's items with one lifted;
 * a meal, one card with Done and no Start; a Checklist block, rows only and
 * nothing lifted; the all-day checklist, the same with its add row. Behind
 * is one muted line under the span, announced once per block, politely.
 * Before Ready, go the screen is the day's List.
 *
 * Below 1024 only; the desk's /today is its own ticket's.
 */
export function NowScreen({
  onComplete = () => {},
}: {
  /** Complete <Block>: the close card is USE-25's, which supplies this. */
  onComplete?: (blockId: string) => void;
} = {}) {
  const source = useDataSource();
  const dateKey = source.todayKey();
  const view = source.scenario.view;

  const [chosenId, setChosenId] = useChosenItem(
    dateKey,
    view?.currentItemId ?? null,
  );
  const sheetSeed = seeded(view?.open, "time-taken");
  // A seeded line stays until the person acts, so a capture holds still.
  const [took, setTook] = React.useState<{ id: string; fades: boolean } | null>(
    () => {
      const id = seeded(view?.open, "took") ?? sheetSeed;
      return id === null ? null : { id, fades: false };
    },
  );
  const [sheetId, setSheetId] = React.useState<string | null>(sheetSeed);
  const [announcement, setAnnouncement] = React.useState("");
  const changeRef = React.useRef<HTMLButtonElement>(null);
  // USE-18: the row whose menu is open, and an order shown while it saves.
  const [menuId, setMenuId] = React.useState<string | null>(
    seeded(view?.open, "menu"),
  );
  const [savingOrder, setSavingOrder] = React.useState<string[] | null>(null);
  const router = useRouter();

  const { view: now } = useNow(dateKey, chosenId);
  const writes = useSlotWrites(dateKey, now?.block?.id ?? null);
  const running = useRunningView(dateKey, now);
  const add = useChecklistAdd(dateKey, now?.block?.id ?? null);
  // USE-20: Start <Block> and End break put a block in focus; the tray is
  // held here so "Or a to-do until …" and the empty state can open it.
  const blockFocus = useBlockFocus(dateKey);
  const [trayOpen, setTrayOpen] = React.useState(view?.open === "todos");
  const empty = now?.empty ?? false;
  React.useEffect(() => {
    // After the last block the day holds nothing else: the tray opens (D-USE-26).
    if (empty) setTrayOpen(true);
  }, [empty]);
  // The footer's arrival is said once, politely: "Wellness complete."
  const completeName =
    now?.footer?.kind === "done" ? now.footer.blockName : null;
  React.useEffect(() => {
    if (completeName !== null)
      setAnnouncement(COPY.announceComplete(completeName));
  }, [completeName]);

  // USE-17: behind is announced once per block, politely; the line stays.
  const behindAnnounced = React.useRef(new Set<string>());
  const behind = now?.block?.behindSince ?? null;
  const behindBlock = now?.block?.id ?? null;
  const behindName = now?.block?.name ?? "";
  React.useEffect(() => {
    if (behind === null || behindBlock === null) return;
    if (behindAnnounced.current.has(behindBlock)) return;
    behindAnnounced.current.add(behindBlock);
    setAnnouncement(COPY.announceBehind(behindName, behind));
  }, [behind, behindBlock, behindName]);

  // The line fades after a few seconds; the planned length stands.
  React.useEffect(() => {
    if (took === null || !took.fades || sheetId !== null) return;
    const timer = setTimeout(() => setTook(null), TOOK_LINE_MS);
    return () => clearTimeout(timer);
  }, [took, sheetId]);

  // The tray is its own region: the day's loading never blanks it (USE-19).
  if (!now)
    return (
      <div className="mx-auto flex w-full max-w-(--content-text) flex-col">
        <NowTodosTray />
      </div>
    );
  const { block, items, current, next } = now;

  if (now.phase === "before-go") {
    return (
      <div className="mx-auto flex w-full max-w-(--content-text) flex-1 flex-col">
        <NowTodosTray />
        <BeforeGoList blocks={now.dayBlocks} />
      </div>
    );
  }

  function markDone(item: NowItemView) {
    // The next lift is only Done's on the current item; a row's box stays put.
    const lifts = item.id === current?.id ? next : current;
    void writes.done(item);
    if (item.id === chosenId) setChosenId(null);
    setTook({ id: item.id, fades: true });
    setAnnouncement(
      COPY.announceDone(
        item.title,
        item.id === current?.id ? (lifts?.title ?? null) : null,
      ),
    );
  }

  /** Done on the running card (USE-23): the time worked, no Change. */
  function markTimedDone(item: NowItemView) {
    if (item.id === chosenId) setChosenId(null);
    setAnnouncement(COPY.announceDone(item.title, next?.title ?? null));
  }

  function markUndone(item: NowItemView) {
    void writes.undo(item);
    if (took?.id === item.id) setTook(null);
  }

  const sheetItem = items.find((item) => item.id === sheetId) ?? null;
  const shown = inOrder(
    items,
    view?.drag ? heldOrder(items, view.drag) : savingOrder,
  );

  /**
   * A drop or a Move: today's order only. The current item is pinned, so a
   * row dropped above the lifted card is next up and the card stays (D-USE-26).
   */
  function reorder(ids: string[], movedId: string | null) {
    if (current) setChosenId(current.id);
    setSavingOrder(ids);
    void writes.reorder(items, ids).finally(() => setSavingOrder(null));
    const moved = items.find((item) => item.id === movedId);
    if (!moved) return;
    const reordered = inOrder(items, ids);
    setAnnouncement(
      COPY.announceMoved(
        moved.title,
        nextItem(reordered, current)?.id === movedId,
      ),
    );
  }

  /** Not today (D-USE-70): off today only, with an Undo. */
  async function notToday(item: NowItemView) {
    const undo = await writes.notToday(item);
    if (item.id === chosenId) setChosenId(null);
    toastUndo({
      text: COPY.offToday(item.title),
      onUndo: () => void writes.undoNotToday(undo),
    });
  }

  /** Swap and Edit open the Item sheet over Now (its own ticket builds it). */
  function openItemSheet(item: NowItemView, swap: boolean) {
    const here = `${window.location.pathname}${window.location.search}`;
    router.push(
      itemSheetRoute(
        here,
        item.blockItemId ?? item.id,
        swap ? "swap" : undefined,
      ),
      { scroll: false },
    );
  }

  function itemRow(item: NowItemView, trailing: React.ReactNode) {
    const timed = isTimedDone(running, item);
    return (
      <PlannerItemRow
        item={{
          id: item.id,
          title: item.title,
          emoji: null,
          checked: item.done,
          meta: timed ? null : COPY.length(item.lengthMin),
        }}
        noEmoji
        fadeChecked
        checkLabel={COPY.boxName(item.title, item.lengthMin)}
        openLabel={item.done ? undefined : COPY.rowName(item.title)}
        onCheckedChange={(_, checked) =>
          checked ? markDone(item) : markUndone(item)
        }
        onOpen={() => {
          if (!item.done) setChosenId(item.id);
        }}
        trailing={
          timed && item.tookMin !== null && item.lengthMin !== null ? (
            <TimedTook tookMin={item.tookMin} planMin={item.lengthMin} />
          ) : (
            trailing
          )
        }
        below={
          took?.id === item.id && item.done && item.tookMin !== null ? (
            <TookLine
              min={item.tookMin}
              changeRef={changeRef}
              onChange={() => setSheetId(item.id)}
            />
          ) : null
        }
      />
    );
  }

  /** Start <Block> or End break (USE-20): that block now; its span stays. */
  function focusBlock(blockId: string | null, endBreak: boolean) {
    if (endBreak) blockFocus.endBreak(blockId);
    else if (blockId !== null) blockFocus.start(blockId);
    setChosenId(null);
  }

  function blockEnd(footer: NowFooter, here: NowBlockView) {
    if (footer.kind === "end-break") {
      return (
        <EndBreakFooter
          onEnd={() => focusBlock(footer.next?.id ?? null, true)}
        />
      );
    }
    const { next: following, doneBefore } = footer;
    return (
      <BlockDoneFooter
        title={COPY.blockComplete(footer.blockName)}
        nextLabel={
          following ? COPY.nextBlock(following.name, following.startsAt) : null
        }
        aheadLine={
          doneBefore !== null && following && view?.ending?.ahead !== false
            ? COPY.doneBefore(doneBefore, following.name, following.endsAt)
            : null
        }
        action={
          following
            ? {
                label: COPY.startBlock(following.name),
                onPress: () => focusBlock(following.id, false),
              }
            : {
                label: COPY.seeTheWholeDay,
                onPress: () => router.push(todayScheduleRoute()),
              }
        }
        todoLink={
          doneBefore !== null && view?.ending?.ahead !== false
            ? {
                label: COPY.todoUntil(doneBefore),
                onPress: () => setTrayOpen(true),
              }
            : null
        }
        addRow={
          now?.addRow && view?.ending?.addRow !== false
            ? {
                label: COPY.addToBlock(now.addRow.blockName),
                freeUntil: COPY.freeUntil(now.addRow.freeUntil),
                // The add sheet is add-from-the-rail's; until then the Block view.
                onPress: () => router.push(todayBlockRoute(here.id)),
              }
            : null
        }
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-(--content-text) flex-1 flex-col">
      <NowTodosTray open={trayOpen} onOpenChange={setTrayOpen} />

      {!block && now.empty ? <NowEmpty /> : null}

      {block ? (
        <section
          aria-labelledby="now-block"
          className="flex flex-1 flex-col px-(--space-4)"
        >
          <div id="now-block">
            <DayBlockHeader
              // The tab's header holds the page's h1 ("Now", USE-83's TabHeader).
              as="h2"
              kind={block.kind}
              name={block.name}
              detail={detailOf(block)}
              glyph={
                block.form === "meal" ? (
                  <MealIcon className="size-4" />
                ) : block.kind === "break" ? (
                  // A true break: the cup in the bar's place (USE-20).
                  <BreakIcon className="size-4" />
                ) : null
              }
              note={
                block.behindSince === null
                  ? null
                  : COPY.plannedToEnd(block.behindSince)
              }
              trailing={
                <NowBlockMenu
                  label={COPY.blockMenu(block.name)}
                  title={COPY.blockMenuTitle(block.name)}
                  rows={nowBlockMenuRows(block, () => onComplete(block.id))}
                  defaultOpen={view?.open === "block-menu"}
                />
              }
            />
          </div>

          {block.form === "checklist" || block.form === "all-day-checklist" ? (
            <ChecklistRows
              rows={items.map((item) => ({
                id: item.id,
                title: item.title,
                checked: item.done,
              }))}
              gripLabel={COPY.gripName}
              onCheckedChange={(id, checked) => {
                const item = items.find((row) => row.id === id);
                if (!item) return;
                if (checked) markDone(item);
                else markUndone(item);
              }}
              add={
                block.form === "all-day-checklist"
                  ? {
                      label: COPY.addToChecklist,
                      placeholder: COPY.addPlaceholder,
                      maxLength: 120,
                      onAdd: (title) => add.mutate({ title, items }),
                    }
                  : null
              }
            />
          ) : (
            <SortableItemRows
              items={shown}
              label={COPY.listName(block.name)}
              frozenId={view?.drag?.itemId ?? null}
              hasGrip={(item) => !item.done && item.id !== current?.id}
              // The list's own live region says where a dragged row went.
              onReorder={(ids) => reorder(ids, null)}
              renderRow={(item, { grip }) => {
                if (item.id === current?.id) {
                  return (
                    <div className="py-(--space-2)">
                      <NowCurrentCard
                        item={item}
                        block={block}
                        dateKey={dateKey}
                        running={running}
                        onPlainDone={markDone}
                        onTimedDone={markTimedDone}
                      />
                    </div>
                  );
                }
                if (item.done) return itemRow(item, null);
                const up = moveIds(items, item.id, -1);
                const down = moveIds(items, item.id, 1);
                return (
                  <RowMenu
                    words={{
                      ...COPY.rowMenu,
                      more: COPY.rowMenu.more(item.title),
                      menu: COPY.rowMenu.menu(item.title),
                    }}
                    open={menuId === item.id}
                    onOpenChange={(open) => setMenuId(open ? item.id : null)}
                    canMoveUp={up !== null}
                    canMoveDown={down !== null}
                    onSwap={() => openItemSheet(item, true)}
                    onEdit={() => openItemSheet(item, false)}
                    onMoveUp={() => up && reorder(up, item.id)}
                    onMoveDown={() => down && reorder(down, item.id)}
                    onNotToday={() => void notToday(item)}
                    clone={itemRow(
                      item,
                      <span className="text-text-muted flex size-(--target) shrink-0 items-center justify-center">
                        <ReorderIcon aria-hidden="true" className="size-4" />
                      </span>,
                    )}
                  >
                    {itemRow(item, grip)}
                  </RowMenu>
                );
              }}
            />
          )}
          {now.footer ? blockEnd(now.footer, block) : null}
        </section>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <TimeTakenSheet
        item={sheetItem}
        open={sheetId !== null}
        returnFocusRef={changeRef}
        onOpenChange={(open) => {
          if (!open) setSheetId(null);
        }}
        onSave={(item, min) => {
          void writes.setTook(item, min);
          setSheetId(null);
          setTook(null);
        }}
      />
    </div>
  );
}

/** The header's second line, by form: the span, or the checklist's words. */
function detailOf(block: NowBlockView): string {
  switch (block.form) {
    case "checklist":
      return COPY.checklistSpan(block.startsAt, block.endsAt);
    case "all-day-checklist":
      return COPY.allDaySpan(block.next);
    default:
      return COPY.span(block.startsAt, block.endsAt);
  }
}
