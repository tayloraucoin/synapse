"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { IconValue } from "@syn/types";
import { ItemIcon, Text, toastUndo } from "@syn/ui";
import { formatMinutesShort } from "@syn/utils";
import { todoInput } from "@syn/validators";
import {
  BLOCK_VIEW_COPY,
  EditingAddRow,
  EventBandRow,
  SwipeRow,
  TodosAddMenu,
  type BlockViewColumnProps,
} from "@/components/planner/block-view";
import { TodosPicker } from "@/components/planner/todos-picker";
import {
  placeTodosInputs,
  todoOrderWrites,
  TODOS_BLOCK_COPY as TODOS,
  todosBlock,
  type TodosBlockRow,
  type TodoTypeFilter,
} from "@/lib/data/block-view-todos";
import { weekdayName } from "@/lib/data/set-up-view";
import { useDataSource } from "@/lib/data/source";
import type { BlockView } from "@/lib/data/use-block-view";
import { usePlannerWrites } from "@/lib/data/use-planner-writes";
import { todosQueryKey } from "@/lib/data/use-todos";
import { weekQueryKey } from "@/lib/data/use-week";
import { todoSheetRoute } from "@/lib/routes";
import { BLOCK_EDIT_COPY as COPY } from "./copy";

/**
 * A To-dos block on This week in editing (USE-50; block-view/states/
 * todos-add-open.md, todos-pool.md, todos-dated-plan.md,
 * todos-sunday-reset.md): its to-dos on the rail at 56 px with their icons,
 * lengths and grips, the day's events as pinned plum bands (a to-do that
 * would cross one moves after it whole), the add row's menu (From To-dos,
 * New to-do), and the lines under it. No Type or place control: a To-dos
 * block holds any type. Every write is the date's slot: the picker's Add
 * places one per to-do after the last (`placeSlot`), a swipe takes the slot
 * off and the to-do is back in To-dos with no day (`removeSlot`, Undo), and
 * New to-do makes the to-do then its slot, so it lands here and in To-dos.
 */

/** "pool", "pool:<id>,<id>", "pool-type:home" from a scenario's `view.open`. */
function seededPool(open: string | undefined): {
  checked: string[];
  type: TodoTypeFilter;
} | null {
  if (open === "pool") return { checked: [], type: null };
  if (open?.startsWith("pool:")) {
    return { checked: open.slice(5).split(","), type: null };
  }
  if (open?.startsWith("pool-type:")) {
    return { checked: [], type: open.slice(10) as TodoTypeFilter };
  }
  return null;
}

type Column = Pick<
  BlockViewColumnProps<TodosBlockRow>,
  | "rows"
  | "reorder"
  | "leading"
  | "title"
  | "trailing"
  | "wrapRow"
  | "add"
  | "afterAdd"
  | "freeFrom"
  | "overMin"
  | "rowHeight"
  | "empty"
>;

export function useTodosEditing({
  data,
  dateKey,
  open,
  addIcon,
  onPickIcon,
  clearAddIcon,
  announce,
}: {
  data: BlockView | null;
  dateKey: string | null;
  open: string | undefined;
  /** The new to-do's icon, picked through the add field's square. */
  addIcon: IconValue | null;
  onPickIcon: () => void;
  clearAddIcon: () => void;
  announce: (words: string) => void;
}): { column: Column; sheets: React.ReactNode } | null {
  const router = useRouter();
  const source = useDataSource();
  const queryClient = useQueryClient();
  const planner = usePlannerWrites();
  const seed = seededPool(open);
  const [picking, setPicking] = React.useState(seed !== null);
  const [adding, setAdding] = React.useState(open === "new-todo");
  const [swipeId, setSwipeId] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<string[] | null>(null);

  if (!data || dateKey === null || data.block.block.kind !== "todos") {
    return null;
  }
  const view = data;
  const date = dateKey;
  const name = view.block.block.name;
  const weekday = weekdayName(view.day.weekday);
  const read = todosBlock(view, order ?? undefined);

  function settle() {
    void queryClient.invalidateQueries({
      queryKey: weekQueryKey(source.scenario.name),
    });
    void queryClient.invalidateQueries({
      queryKey: todosQueryKey(source.scenario.name),
    });
  }

  function reorder(ids: string[]) {
    const moves = todoOrderWrites(read.todos, ids);
    if (moves.length === 0) return;
    setOrder(ids.filter((id) => read.todos.some((row) => row.id === id)));
    void Promise.all(
      moves.map((move) =>
        source.server.writeSlots({
          id: move.slotId,
          sortOrder: move.sortOrder,
        }),
      ),
    )
      .catch(() => {})
      .finally(() => {
        settle();
        setOrder(null);
      });
  }

  async function remove(row: Extract<TodosBlockRow, { kind: "todo" }>) {
    setSwipeId(null);
    const write = await planner.removeSlot({ id: row.id });
    settle();
    const words = TODOS.removed(row.title, weekday);
    announce(words);
    toastUndo({
      text: words,
      onUndo: () => void planner.undo(write.undo).then(settle),
    });
  }

  async function addPicked(todoIds: string[], titles: string[]) {
    setPicking(false);
    if (todoIds.length === 0) return;
    const done: Awaited<ReturnType<typeof planner.placeSlot>>[] = [];
    for (const input of placeTodosInputs(view, todoIds)) {
      done.push(await planner.placeSlot(input));
    }
    settle();
    const words = TODOS.added(titles, name);
    announce(words);
    toastUndo({
      text: words,
      onUndo: () =>
        void (async () => {
          for (const write of [...done].reverse())
            await planner.undo(write.undo);
          settle();
        })(),
    });
  }

  async function addNew(title: string) {
    const icon = addIcon;
    clearAddIcon();
    // A new one lands here and in To-dos (todoInput, then placeSlot).
    const todo = await source.server.writeTodo(
      todoInput.parse({ title, type: "other", ...(icon ? { icon } : {}) }),
    );
    await planner.placeSlot({
      blockId: view.block.block.id,
      onDate: date,
      sortOrder: todosBlock(view).nextSortOrder,
      todoId: todo.id,
    });
    settle();
    const words = TODOS.newAdded(title, name);
    announce(words);
    toastUndo({
      text: words,
      onUndo: () => void source.server.removeTodo(todo.id).then(() => settle()),
    });
  }

  const column: Column = {
    rows: read.rows,
    rowHeight: () => 56,
    reorder: { onReorder: reorder },
    leading: (row) =>
      row.kind === "todo" ? (
        <ItemIcon icon={row.icon} size={24} className="shrink-0" />
      ) : null,
    // A to-do's name opens its own To-do sheet (todos-add-open.md [ASSUMPTION]).
    title: (row) =>
      row.kind === "event" ? (
        row.title
      ) : (
        <button
          type="button"
          data-row-open
          onClick={() =>
            router.push(
              todoSheetRoute(
                `${window.location.pathname}${window.location.search}`,
                { id: row.todoId },
              ),
              { scroll: false },
            )
          }
          className="max-w-full truncate rounded-(--radius-control) text-start text-(length:--fs-body) outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {row.title}
        </button>
      ),
    trailing: (row, slots) =>
      row.kind === "event" ? null : (
        <>
          <span className="text-text-muted shrink-0 text-(length:--fs-caption) leading-(--lh-caption) tabular-nums">
            {formatMinutesShort(row.lengthMin)}
          </span>
          {slots.grip}
        </>
      ),
    wrapRow: (row, body) =>
      row.kind === "event" ? (
        // Pinned: no grip, no length, no swipe (todos-dated-plan.md).
        <div className="py-(--space-1)">
          <EventBandRow title={row.title} words={row.words} />
        </div>
      ) : (
        <SwipeRow
          open={swipeId === row.id}
          onOpenChange={(next) => setSwipeId(next ? row.id : null)}
          removeLabel={COPY.remove}
          removeName={COPY.removeName(row.title)}
          onRemove={() => void remove(row)}
        >
          {body}
        </SwipeRow>
      ),
    empty: (
      <Text as="p" variant="body">
        {COPY.empty(name)}
      </Text>
    ),
    add: {
      at: read.reflow.freeFrom,
      node: adding ? (
        <EditingAddRow
          label={TODOS.newTodo}
          length={BLOCK_VIEW_COPY.length(5)}
          onSubmit={(title) => void addNew(title).catch(() => {})}
          icon={addIcon}
          onPickIcon={onPickIcon}
          autoOpen
          onClose={() => setAdding(false)}
        />
      ) : (
        <TodosAddMenu
          label={TODOS.addTo(name)}
          words={{
            fromTodos: TODOS.fromTodos,
            newTodo: TODOS.newTodo,
            footer: TODOS.menuFooter,
          }}
          onFromTodos={() => setPicking(true)}
          onNewTodo={() => setAdding(true)}
          defaultOpen={open === "add"}
        />
      ),
    },
    afterAdd: (
      <div className="flex flex-col gap-(--space-1)">
        {read.lines.map((line) => (
          <Text key={line} as="p" variant="caption" tone="muted">
            {line}
          </Text>
        ))}
      </div>
    ),
    freeFrom: read.reflow.freeFrom,
    overMin: read.reflow.overMin,
  };

  const sheets = (
    <TodosPicker
      open={picking}
      onOpenChange={setPicking}
      block={view}
      dateKey={date}
      onAdd={(ids, titles) => void addPicked(ids, titles).catch(() => {})}
      onNewTodo={() => {
        setPicking(false);
        setAdding(true);
      }}
      initial={seed ?? undefined}
    />
  );

  return { column, sheets };
}
