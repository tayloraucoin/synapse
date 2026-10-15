"use client";

import * as React from "react";
import { MealIcon, ReorderIcon } from "@syn/ui";
import {
  BLOCK_HUE,
  ChecklistRows,
  DayBlockHeader,
  LiftedCard,
  NowBlockMenu,
  PlannerItemRow,
} from "@/components/planner";
import { useDataSource } from "@/lib/data/source";
import {
  useChecklistAdd,
  useNow,
  useSlotWrites,
  type NowBlockView,
  type NowItemView,
} from "@/lib/data/use-now";
import { BeforeGoList } from "./before-go-list";
import { nowBlockMenuRows } from "./block-menu";
import { NOW_COPY as COPY, TOOK_LINE_MS } from "./copy";
import { NowTodosTray } from "./now-todos-tray";
import { TimeTakenSheet } from "./time-taken-sheet";
import { TookLine } from "./took-line";

/** `view.open` from a scenario: "<what>:<item id>". */
function seeded(open: string | undefined, what: string): string | null {
  const prefix = `${what}:`;
  return open?.startsWith(prefix) ? open.slice(prefix.length) : null;
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

  const [chosenId, setChosenId] = React.useState<string | null>(
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

  const { view: now } = useNow(dateKey, chosenId);
  const writes = useSlotWrites(dateKey, now?.block?.id ?? null);
  const add = useChecklistAdd(dateKey, now?.block?.id ?? null);

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

  function markUndone(item: NowItemView) {
    void writes.undo(item);
    if (took?.id === item.id) setTook(null);
  }

  const sheetItem = items.find((item) => item.id === sheetId) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-(--content-text) flex-col">
      <NowTodosTray />

      {block ? (
        <section
          aria-labelledby="now-block"
          className="flex flex-col px-(--space-4)"
        >
          <div id="now-block">
            <DayBlockHeader
              // The tab's header holds the page's h1 ("Now", USE-83's TabHeader).
              as="h2"
              kind={block.kind}
              name={block.name}
              detail={detailOf(block)}
              glyph={
                block.form === "meal" ? <MealIcon className="size-4" /> : null
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
            <ul className="flex flex-col gap-(--space-1)">
              {items.map((item) =>
                item.id === current?.id ? (
                  <li key={item.id} className="py-(--space-2)">
                    <LiftedCard
                      title={item.title}
                      icon={item.icon}
                      hue={
                        block.form === "meal"
                          ? "neutral"
                          : BLOCK_HUE[block.kind]
                      }
                      meta={COPY.meta(item.lengthMin, item.plannedAt)}
                      label={COPY.liftedName(item.title)}
                      // A meal has no Start. Start's running card is USE-23's;
                      // until then it is drawn and quiet.
                      start={
                        block.form === "meal"
                          ? null
                          : { label: COPY.start, onPress: () => {} }
                      }
                      done={{
                        label: COPY.done,
                        name: COPY.doneName(item.title),
                        onPress: () => markDone(item),
                      }}
                    />
                  </li>
                ) : (
                  <li key={item.id}>
                    <PlannerItemRow
                      item={{
                        id: item.id,
                        title: item.title,
                        emoji: null,
                        checked: item.done,
                        meta: COPY.length(item.lengthMin),
                      }}
                      noEmoji
                      fadeChecked
                      checkLabel={COPY.boxName(item.title, item.lengthMin)}
                      openLabel={
                        item.done ? undefined : COPY.rowName(item.title)
                      }
                      onCheckedChange={(_, checked) =>
                        checked ? markDone(item) : markUndone(item)
                      }
                      onOpen={() => {
                        if (!item.done) setChosenId(item.id);
                      }}
                      trailing={
                        item.done ? null : (
                          // Dragging and Move up / Move down are USE-18's.
                          <button
                            type="button"
                            aria-label={COPY.gripName(item.title)}
                            className="text-text-muted flex size-(--target) shrink-0 cursor-grab items-center justify-center rounded-(--radius-control) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          >
                            <ReorderIcon
                              aria-hidden="true"
                              className="size-4"
                            />
                          </button>
                        )
                      }
                      below={
                        took?.id === item.id &&
                        item.done &&
                        item.tookMin !== null ? (
                          <TookLine
                            min={item.tookMin}
                            changeRef={changeRef}
                            onChange={() => setSheetId(item.id)}
                          />
                        ) : null
                      }
                    />
                  </li>
                ),
              )}
            </ul>
          )}
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
