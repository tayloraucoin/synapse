"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  BreakIcon,
  MealIcon,
  RegionRetry,
  ReorderIcon,
  toastUndo,
} from "@syn/ui";
import { nextItem } from "@syn/utils";
import {
  BlockDoneFooter,
  ChecklistRows,
  DayBlockHeader,
  NotSavedLine,
  NowBlockMenu,
  NowSkeleton,
  OfflineLine,
  PlannerItemRow,
  RowMenu,
  RunningGroup,
  SortableItemRows,
} from "@/components/planner";
import type { NowFooter } from "@/lib/data/now-end";
import { isTimedDone, runningGroup, useRunningView } from "@/lib/data/running";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import { closeSeed, useBlockClose } from "@/lib/data/use-block-close";
import { useBlockFocus } from "@/lib/data/use-block-focus";
import {
  moveIds,
  useChecklistAdd,
  useChosenItem,
  useNow,
  useSlotWrites,
  type NowBlockView,
  type NowItemView,
} from "@/lib/data/use-now";
import {
  itemSheetRoute,
  todayBlockRoute,
  todayScheduleRoute,
} from "@/lib/routes";
import { BeforeGoList } from "./before-go-list";
import { nowBlockMenuRows } from "./block-menu";
import { NOW_COPY as COPY, TOOK_LINE_MS } from "./copy";
import { EndBreakFooter } from "./end-break-footer";
import { NowCloseCard } from "./now-close-card";
import { NowCurrentCard } from "./now-current-card";
import { NowEmpty } from "./now-empty";
import { NowMealTopics } from "./now-meal-topics";
import { NowRunningRows } from "./now-running-rows";
import { NowTodosTray } from "./now-todos-tray";
import { RUNNING_COPY } from "./running-copy";
import { TimeTakenSheet } from "./time-taken-sheet";
import { TimedTook } from "./timed-took";
import { TookLine } from "./took-line";
import { WorkBlockNow } from "./work-block-now";

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

/** A to-do's emoji on its row (USE-21); a set item's icon is the card's only. */
function rowEmoji(item: NowItemView): string | null {
  return item.source === "todo" && item.icon?.kind === "emoji"
    ? item.icon.value
    : null;
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
export function NowScreen() {
  const source = useDataSource();
  const dateKey = source.todayKey();
  const view = source.scenario.view;
  // USE-25: a block closed with items left, and its card (seeded first, so
  // the day is read with it).
  const blockClose = useBlockClose(dateKey, closeSeed(view?.open));

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
  // USE-24: rows Done a moment ago, held settled under "Running"; a seeded
  // one stays until the person acts, so a capture holds still.
  const [settledIds, setSettledIds] = React.useState<ReadonlySet<string>>(
    () => {
      const id = seeded(view?.open, "settled");
      return new Set(id === null ? [] : [id]);
    },
  );
  const settleTimers = React.useRef(new Set<ReturnType<typeof setTimeout>>());
  React.useEffect(() => {
    const timers = settleTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);
  // After a lift, focus moves to the card (USE-24 [PROPOSED]).
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [liftFocus, setLiftFocus] = React.useState(false);
  React.useEffect(() => {
    if (!liftFocus) return;
    cardRef.current?.focus();
    setLiftFocus(false);
  }, [liftFocus, chosenId]);

  // USE-21: a check that did not save, online: the state it was asked for.
  const [failed, setFailed] = React.useState<ReadonlyMap<string, boolean>>(
    () => new Map(),
  );
  const offline = useIsOffline();

  const nowQuery = useNow(dateKey, chosenId);
  const { view: now } = nowQuery;
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

  // Offline is not an error (USE-21): one line above the tray, all else as online.
  const top = (
    <>
      {offline ? <OfflineLine text={COPY.offline} /> : null}
      <NowTodosTray open={trayOpen} onOpenChange={setTrayOpen} />
    </>
  );

  // The tray is its own region: the day's loading or failure never blanks it
  // (USE-19), and the block's failure is its own, in place (USE-21).
  if (!now)
    return (
      <div className="mx-auto flex w-full max-w-(--content-text) flex-col">
        {top}
        {nowQuery.isError ? (
          <RegionRetry
            label={COPY.blockFailed}
            onRetry={() => {
              source.server.recover();
              void nowQuery.refetch();
            }}
            className="px-(--space-4)"
          />
        ) : (
          <NowSkeleton label={COPY.loading} />
        )}
      </div>
    );
  const { block, items, current, next } = now;

  if (now.phase === "before-go") {
    return (
      <div className="mx-auto flex w-full max-w-(--content-text) flex-1 flex-col">
        {top}
        <BeforeGoList blocks={now.dayBlocks} />
      </div>
    );
  }

  /**
   * A check's write (USE-21). Offline it lands as online (the queue is wave
   * 3's); online and refused, the box reads as the day does (unchecked again)
   * and the row says "Not saved. Try again." in ink.
   */
  function saveCheck(
    item: NowItemView,
    checked: boolean,
    write: Promise<unknown>,
  ) {
    setFailed((map) => without(map, item.id));
    write.catch(() => {
      setFailed((map) => new Map(map).set(item.id, checked));
      setTook((line) => (line?.id === item.id ? null : line));
      setAnnouncement(COPY.announceNotSaved(item.title));
    });
  }

  function retryCheck(item: NowItemView) {
    const checked = failed.get(item.id);
    if (checked === undefined) return;
    if (checked) markDone(item);
    else markUndone(item);
  }

  function notSavedUnder(item: NowItemView) {
    return failed.has(item.id) ? (
      <NotSavedLine words={COPY.notSaved} onRetry={() => retryCheck(item)} />
    ) : null;
  }

  function markDone(item: NowItemView) {
    // The next lift is only Done's on the current item; a row's box stays put.
    const lifts = item.id === current?.id ? next : current;
    saveCheck(item, true, writes.done(item));
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

  /** Lifting a Running row (D-USE-27): focus only; no event is written. */
  function liftRow(item: NowItemView) {
    setChosenId(item.id);
    setLiftFocus(true);
    setAnnouncement(RUNNING_COPY.inFocus(item.title));
  }

  /** Done on a Running row: settled a moment, then back in its place. */
  function settleRow(item: NowItemView) {
    setSettledIds((ids) => new Set(ids).add(item.id));
    setAnnouncement(COPY.announceDone(item.title, null));
    const timer = setTimeout(() => {
      settleTimers.current.delete(timer);
      setSettledIds((ids) => {
        const rest = new Set(ids);
        rest.delete(item.id);
        return rest;
      });
    }, TOOK_LINE_MS);
    settleTimers.current.add(timer);
  }

  function markUndone(item: NowItemView) {
    saveCheck(item, false, writes.undo(item));
    if (took?.id === item.id) setTook(null);
  }

  const sheetItem = items.find((item) => item.id === sheetId) ?? null;
  // USE-24: several running in a non-work block gather under "Running".
  const group = runningGroup(now, running, settledIds);
  const grouped = new Set(
    group ? [group.focusedId, ...group.rows.map((row) => row.item.id)] : [],
  );
  const shown = inOrder(
    items,
    view?.drag ? heldOrder(items, view.drag) : savingOrder,
  ).filter((item) => !grouped.has(item.id));

  function currentCard(item: NowItemView, block: NowBlockView) {
    return (
      <NowCurrentCard
        item={item}
        block={block}
        dateKey={dateKey}
        running={running}
        onPlainDone={markDone}
        onTimedDone={markTimedDone}
        below={notSavedUnder(item)}
      />
    );
  }

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
          emoji: rowEmoji(item),
          checked: item.done,
          meta: timed ? null : COPY.length(item.lengthMin),
        }}
        noEmoji={item.source !== "todo"}
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
          ) : (
            notSavedUnder(item)
          )
        }
      />
    );
  }

  /**
   * Complete <Block> (USE-25): with items left, or none, the close card; all
   * done, USE-20's footer already stands and nothing more happens.
   */
  function complete(here: NowBlockView) {
    const shows = blockClose.complete(
      here.id,
      items.map((item) => ({
        id: item.id,
        title: item.title,
        lengthMin: item.lengthMin,
        done: item.done,
        row: {
          sortOrder: item.sortOrder,
          blockItemId: item.blockItemId,
          slotId: item.slotId,
        },
      })),
    );
    if (shows) {
      setChosenId(null);
      setAnnouncement(COPY.close.announce(here.name, here.next));
    }
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
      {top}

      {!block && now.empty && !now.closing ? <NowEmpty /> : null}

      {now.closing && blockClose.state.card ? (
        <section
          aria-label={COPY.blockComplete(now.closing.block.name)}
          className="flex flex-1 flex-col px-(--space-4)"
        >
          <NowCloseCard
            closing={now.closing}
            blockClose={blockClose}
            now={source.now()}
            onDoNow={setChosenId}
            onLifted={() => setLiftFocus(true)}
            onAnnounce={setAnnouncement}
          />
        </section>
      ) : block?.kind === "work" ? (
        // USE-57: a Work block is Today's tiers, not a block's items.
        <WorkBlockNow
          block={block}
          trailing={
            <NowBlockMenu
              label={COPY.blockMenu(block.name)}
              title={COPY.blockMenuTitle(block.name)}
              rows={nowBlockMenuRows(block, () => complete(block))}
              defaultOpen={view?.open === "block-menu"}
            />
          }
        />
      ) : block ? (
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
                  rows={nowBlockMenuRows(block, () => complete(block))}
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
            <>
              {group && running ? (
                <RunningGroup
                  heading={RUNNING_COPY.group}
                  card={
                    group.focusedId !== null && current ? (
                      <div
                        ref={cardRef}
                        tabIndex={-1}
                        className="rounded-md outline-none"
                      >
                        {currentCard(current, block)}
                      </div>
                    ) : null
                  }
                >
                  <NowRunningRows
                    rows={group.rows}
                    running={running}
                    dateKey={dateKey}
                    blockId={block.id}
                    onLift={liftRow}
                    onDone={settleRow}
                  />
                </RunningGroup>
              ) : null}
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
                        {currentCard(item, block)}
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
            </>
          )}
          {block.form === "meal" ? (
            <NowMealTopics
              dateKey={dateKey}
              blockId={block.id}
              seed={seeded(view?.open, "topic")}
            />
          ) : null}
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
      // A To-dos block names its kind first (D-USE-74).
      return block.kind === "todos"
        ? COPY.todosSpan(block.startsAt, block.endsAt)
        : COPY.span(block.startsAt, block.endsAt);
  }
}

function without<V>(map: ReadonlyMap<string, V>, id: string) {
  if (!map.has(id)) return map;
  const next = new Map(map);
  next.delete(id);
  return next;
}
