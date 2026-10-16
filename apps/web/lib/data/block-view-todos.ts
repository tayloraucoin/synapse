import type { IconValue } from "@syn/types";
import {
  clockMinutes,
  dateKeyIn,
  readDay,
  reflowItems,
  todoPool,
  weekdayIndex,
  type Reflow,
} from "@syn/utils";
import type {
  DayEventRecord,
  PlaceSlotInput,
  TodoRecord,
} from "@syn/validators";
import { clockWords, weekdayName } from "./set-up-view";
import type { BlockView } from "./use-block-view";
import type { TodosRecords } from "./use-todos";

/**
 * A To-dos block in Block view's editing (USE-50; block-view/states/
 * todos-*.md, open-5 round 4, D-USE-74, D-USE-87): the to-dos slotted into
 * the block for its date, laid on the rail from its start with the day's
 * events pinned as bands (a to-do that would cross one moves after it
 * whole), and the From To-dos picker over USE-9's `todoPool`: to-dos with
 * no day, oldest first, any type. The Type chips narrow the picker's list
 * only; the block never filters by type. A to-do already in the block is
 * listed greyed, "In <block>", and can't be picked. A to-do's length is its
 * slot's, 5 min until set. Pure, so a test reads what the view draws. Every
 * word is printed here.
 */

/** D-USE-81, D-USE-87: a to-do with no length counts 5 minutes. */
export const TODO_DEFAULT_MIN = 5;

const TYPE_WORDS: Record<TodoRecord["type"], string> = {
  home: "Home",
  errand: "Errand",
  call: "Call",
  digital: "Digital",
  other: "Other",
};

const SHORT_DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "Sat 17". */
function dayWords(dateKey: string): string {
  return `${SHORT_DAY[weekdayIndex(dateKey)]} ${Number(dateKey.slice(8, 10))}`;
}

/** "Mon 5 Oct". */
function dateWords(dateKey: string): string {
  return `${dayWords(dateKey)} ${MONTH[Number(dateKey.slice(5, 7)) - 1]}`;
}

function andList(words: readonly string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

/** "repeats monthly", "repeats every 2 weeks" [ASSUMPTION: from the rule's FREQ and INTERVAL]. */
export function repeatWords(rrule: string): string {
  const freq = /FREQ=([A-Z]+)/.exec(rrule)?.[1] ?? "";
  const every = Number(/INTERVAL=(\d+)/.exec(rrule)?.[1] ?? "1");
  const unit = {
    DAILY: ["daily", "days"],
    WEEKLY: ["weekly", "weeks"],
    MONTHLY: ["monthly", "months"],
    YEARLY: ["yearly", "years"],
  }[freq];
  if (!unit) return "repeats";
  return every > 1 ? `repeats every ${every} ${unit[1]}` : `repeats ${unit[0]}`;
}

export const TODOS_BLOCK_COPY = {
  addTo: (block: string) => `Add to ${block}`,
  fromTodos: "From To-dos",
  newTodo: "New to-do",
  menuFooter: "A new one lands here and in To-dos.",
  /** The line under the add row (todos-add-open.md). */
  pickedLine: (weekday: string, end: string) =>
    `Picked from To-dos for this ${weekday}, any type. Anything not done by ${end} goes back to To-dos, never lost.`,
  /** An event inside the block (todos-dated-plan.md). */
  eventLine: (event: string, weekday: string, block: string) =>
    `${event} is a dated plan for this ${weekday} only, a band inside ${block} at its time.`,
  movedLine: (titles: readonly string[]) =>
    `${andList(titles)} moved after it: an item is never split.`,
  /** A repeating to-do in the block (todos-sunday-reset.md). */
  repeatLine: (title: string, repeats: string) =>
    `${title} ${repeats}; once done, its next one waits in To-dos.`,
  /** The band's trailing words: "Personal · 11:00 to 11:30". */
  band: (tag: string | null, span: string) =>
    tag === null ? span : `${tag} · ${span}`,
  bandName: (title: string, words: string) => `${title}, ${words}`,
  span: (from: string, to: string) =>
    `${clockWords(from)} to ${clockWords(to)}`,
  removed: (title: string, weekday: string) =>
    `${title} back in To-dos, off this ${weekday}.`,
  added: (titles: readonly string[], block: string) =>
    titles.length === 1
      ? `${titles[0]} added to ${block}`
      : `${titles.length === 2 ? andList(titles) : "To-dos"} added to ${block}`,
  newAdded: (title: string, block: string) =>
    `${title} added to ${block} and To-dos`,
  picker: {
    title: "From To-dos",
    close: "Close",
    /** "Into Errands · Sat 17, 10:00 to 12:30". */
    context: (block: string, dateKey: string, from: string, to: string) =>
      `Into ${block} · ${dayWords(dateKey)}, ${clockWords(from)} to ${clockWords(to)}`,
    allTypes: "All types",
    types: "Type",
    /** The chips' names (by-kind.md, Access): "Type, Errand". */
    chipName: (value: string) => `Type, ${value}`,
    checkbox: (title: string, length: string) => `${title}, ${length}`,
    inBlock: (block: string) => `In ${block}`,
    length: (min: number) => `${min} min`,
    added: (type: string, dateKey: string) =>
      `${type} · added ${dateWords(dateKey)}`,
    repeats: (type: string, rrule: string) => `${type} · ${repeatWords(rrule)}`,
    /** D-USE-87: the picks past the end are said in ink; adding stays allowed. */
    footer: (
      titles: readonly string[],
      block: string,
      to: string,
      inside: boolean,
    ) =>
      `Adds ${andList(titles)}. ${block} then runs to ${to}, ${inside ? "inside" : "past"} its time.`,
    nothing: "Nothing in To-dos.",
    loading: "Loading To-dos",
    failed: "To-dos didn't load.",
    addTo: (block: string) => `Add to ${block}`,
  },
} as const;

export type TodosBlockRow =
  | {
      kind: "todo";
      /** The slot's id. */
      id: string;
      todoId: string;
      title: string;
      icon: IconValue | null;
      lengthMin: number;
      startsAt: string;
      sortOrder: number;
      done: boolean;
    }
  | {
      kind: "event";
      /** The event's id. */
      id: string;
      title: string;
      /** "Personal · 11:00 to 11:30". */
      words: string;
      startsAt: string;
      lengthMin: null;
      done: false;
    };

export interface TodosBlock {
  rows: TodosBlockRow[];
  /** The to-dos only, in their order. */
  todos: Extract<TodosBlockRow, { kind: "todo" }>[];
  reflow: Reflow;
  /** The lines under the add row. */
  lines: string[];
  /** The next slot's sort order: after the last. */
  nextSortOrder: number;
}

function tagWords(event: DayEventRecord): string | null {
  return event.tag === "work"
    ? "Work"
    : event.tag === "personal"
      ? "Personal"
      : null;
}

function flow(
  view: BlockView,
  rows: readonly { id: string; lengthMin: number }[],
  bands: boolean,
): Reflow {
  return reflowItems({
    startsAt: view.block.startsAt,
    endsAt: view.block.endsAt,
    items: rows.map((row) => ({
      id: row.id,
      lengthMin: row.lengthMin,
      atTime: null,
    })),
    bands: bands ? view.events : [],
  });
}

/** Where the last row ends ("HH:MM" minutes), the bands pinned. */
function lastEnd(
  reflow: Reflow,
  rows: readonly { id: string; lengthMin: number }[],
  from: string,
): number {
  const length = new Map(rows.map((row) => [row.id, row.lengthMin]));
  return reflow.placed.reduce(
    (end, placed) =>
      Math.max(
        end,
        clockMinutes(placed.startsAt) + (length.get(placed.id) ?? 0),
      ),
    clockMinutes(from),
  );
}

function wall(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/** The block's rows on the rail: its to-dos re-flowed around the day's events. */
export function todosBlock(
  view: BlockView,
  order?: readonly string[],
): TodosBlock {
  const todos = new Map(view.day.records.todos.map((todo) => [todo.id, todo]));
  const rank = new Map((order ?? []).map((id, index) => [id, index]));
  const slots = view.block.slots
    .filter((slot) => slot.todoId !== null && todos.has(slot.todoId))
    .sort(
      (a, b) =>
        (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity) ||
        a.sortOrder - b.sortOrder ||
        a.id.localeCompare(b.id),
    );
  const bare = slots.map((slot) => {
    const todo = todos.get(slot.todoId!)!;
    return {
      slot,
      todo,
      id: slot.id,
      lengthMin: slot.lengthMin ?? todo.lengthMin ?? TODO_DEFAULT_MIN,
    };
  });
  const reflow = flow(view, bare, true);
  const unbanded = flow(view, bare, false);
  const startOf = new Map(reflow.placed.map((p) => [p.id, p.startsAt]));
  const naiveOf = new Map(unbanded.placed.map((p) => [p.id, p.startsAt]));

  const todoRows = bare.map(
    ({ slot, todo, lengthMin }): Extract<TodosBlockRow, { kind: "todo" }> => ({
      kind: "todo",
      id: slot.id,
      todoId: todo.id,
      title: todo.title,
      icon: slot.icon ?? todo.icon,
      lengthMin,
      startsAt: startOf.get(slot.id) ?? view.block.startsAt,
      sortOrder: slot.sortOrder,
      done: slot.doneAt !== null,
    }),
  );
  const bands = view.events.map(
    (event): Extract<TodosBlockRow, { kind: "event" }> => ({
      kind: "event",
      id: event.id,
      title: event.title,
      words: TODOS_BLOCK_COPY.band(
        tagWords(event),
        TODOS_BLOCK_COPY.span(event.startsAt, event.endsAt),
      ),
      startsAt: event.startsAt,
      lengthMin: null,
      done: false,
    }),
  );
  const rows = [...todoRows, ...bands]
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        a.row.startsAt.localeCompare(b.row.startsAt) ||
        // At one time a band reads before the to-do after it.
        (a.row.kind === "event" ? -1 : 0) - (b.row.kind === "event" ? -1 : 0) ||
        a.index - b.index,
    )
    .map(({ row }) => row);

  const weekday = weekdayName(view.day.weekday);
  const lines: string[] = [];
  const event = view.events[0];
  if (event) {
    lines.push(
      TODOS_BLOCK_COPY.eventLine(event.title, weekday, view.block.block.name),
    );
    // Moved: a to-do the bands put later than it would lie without them.
    const moved = todoRows
      .filter((row) => naiveOf.get(row.id) !== row.startsAt)
      .filter((row) => view.events.some((band) => band.endsAt <= row.startsAt))
      .map((row) => row.title);
    if (moved.length > 0) lines.push(TODOS_BLOCK_COPY.movedLine(moved));
  } else {
    lines.push(
      TODOS_BLOCK_COPY.pickedLine(weekday, clockWords(view.block.endsAt)),
    );
  }
  for (const { todo } of bare) {
    if (todo.rrule) {
      lines.push(
        TODOS_BLOCK_COPY.repeatLine(todo.title, repeatWords(todo.rrule)),
      );
    }
  }

  return {
    rows,
    todos: todoRows,
    reflow,
    lines,
    nextSortOrder:
      view.block.slots.reduce(
        (max, slot) => Math.max(max, slot.sortOrder),
        -1,
      ) + 1,
  };
}

export type TodoTypeFilter = TodoRecord["type"] | null;

export interface TodosPickerRow {
  todoId: string;
  title: string;
  icon: IconValue | null;
  /** "Errand · added Mon 5 Oct", "Errand · repeats monthly". */
  meta: string;
  /** "15 min"; "In Errands" on a greyed row. */
  trailing: string;
  /** Already in the block: greyed, no checkbox. */
  inBlock: boolean;
  /** The checkbox's name: "Return the parcel, 15 min". */
  name: string;
  lengthMin: number;
}

export interface TodosPickerView {
  context: string;
  /** "All types" (null) then only the types among the to-dos to pick. */
  chips: { value: TodoTypeFilter; label: string; name: string }[];
  rows: TodosPickerRow[];
  /** Over Add; null with nothing checked. `inside` false is said in ink. */
  footer: { text: string; inside: boolean } | null;
  /** The checked to-dos still listed and pickable, in the list's order. */
  checked: string[];
  /** Their names, for the Toaster. */
  titles: string[];
}

/** Each to-do slot's block end, read as the day reads its date. */
function slotEnds(records: TodosRecords): Map<string, Date> {
  const ends = new Map<string, Date>();
  const dates = new Set(records.slots.map((slot) => slot.onDate));
  for (const dateKey of dates) {
    const read = readDay({
      dateKey,
      timeZone: records.timeZone,
      blocks: records.blocks,
      changes: records.blockChanges,
      slots: records.slots,
    });
    for (const occurrence of read.blocks) {
      for (const slot of occurrence.slots) ends.set(slot.id, occurrence.end);
    }
  }
  return ends;
}

/**
 * The picker over USE-9's pool: to-dos with no day, oldest first, any type;
 * the block's own to-dos after them, greyed. `type` narrows this list only.
 */
export function todosPickerView(input: {
  records: TodosRecords;
  view: BlockView;
  now: Date;
  checked: readonly string[];
  type: TodoTypeFilter;
}): TodosPickerView {
  const { records, view } = input;
  const P = TODOS_BLOCK_COPY.picker;
  const name = view.block.block.name;
  const dateKey = view.day.date ?? "";
  const byId = new Map(records.todos.map((todo) => [todo.id, todo]));
  const ends = slotEnds(records);
  const pool = todoPool({
    todos: records.todos,
    slots: records.slots.map((slot) => ({
      todoId: slot.todoId,
      onDate: slot.onDate,
      doneAt: slot.doneAt,
      // A slot no block holds on its date (the block skipped) is already back.
      blockEnd: ends.get(slot.id) ?? new Date(0),
    })),
    now: input.now,
  });
  const block = todosBlock(view);
  const here = new Set(block.todos.map((row) => row.todoId));

  const listed: { todo: TodoRecord; inBlock: boolean }[] = [
    ...pool
      .map((entry) => byId.get(entry.todoId))
      .filter((todo): todo is TodoRecord => !!todo && !here.has(todo.id))
      .map((todo) => ({ todo, inBlock: false })),
    ...block.todos
      .map((row) => byId.get(row.todoId))
      .filter((todo): todo is TodoRecord => !!todo)
      .map((todo) => ({ todo, inBlock: true })),
  ];

  // The types among the to-dos that can be picked [ASSUMPTION: a type only
  // the greyed rows hold would narrow the list to nothing to pick].
  const types = new Set(
    listed.filter(({ inBlock }) => !inBlock).map(({ todo }) => todo.type),
  );
  const chips: TodosPickerView["chips"] = [
    { value: null, label: P.allTypes, name: P.chipName(P.allTypes) },
    ...(Object.keys(TYPE_WORDS) as TodoRecord["type"][])
      .filter((type) => types.has(type))
      .map((type) => ({
        value: type,
        label: TYPE_WORDS[type],
        name: P.chipName(TYPE_WORDS[type]),
      })),
  ];

  const rows = listed
    .filter(({ todo }) => input.type === null || todo.type === input.type)
    .map(({ todo, inBlock }): TodosPickerRow => {
      const lengthMin = todo.lengthMin ?? TODO_DEFAULT_MIN;
      const length = P.length(lengthMin);
      const type = TYPE_WORDS[todo.type];
      return {
        todoId: todo.id,
        title: todo.title,
        icon: todo.icon,
        meta: todo.rrule
          ? P.repeats(type, todo.rrule)
          : P.added(
              type,
              dateKeyIn(new Date(todo.createdAt), records.timeZone),
            ),
        trailing: inBlock ? P.inBlock(name) : length,
        inBlock,
        name: P.checkbox(todo.title, length),
        lengthMin,
      };
    });

  // Checked rows a filter hides still count: the filter narrows the list only.
  const pickable = new Map(
    listed.filter(({ inBlock }) => !inBlock).map(({ todo }) => [todo.id, todo]),
  );
  const checked = listed
    .filter(
      ({ todo }) => pickable.has(todo.id) && input.checked.includes(todo.id),
    )
    .map(({ todo }) => todo.id);

  let footer: TodosPickerView["footer"] = null;
  if (checked.length > 0) {
    const all = [
      ...block.todos.map((row) => ({ id: row.id, lengthMin: row.lengthMin })),
      ...checked.map((id) => ({
        id,
        lengthMin: pickable.get(id)!.lengthMin ?? TODO_DEFAULT_MIN,
      })),
    ];
    const reflow = flow(view, all, true);
    const end = lastEnd(reflow, all, view.block.startsAt);
    const inside = end <= clockMinutes(view.block.endsAt);
    footer = {
      text: P.footer(
        checked.map((id) => pickable.get(id)!.title),
        name,
        wall(end),
        inside,
      ),
      inside,
    };
  }

  return {
    context: P.context(name, dateKey, view.block.startsAt, view.block.endsAt),
    chips,
    rows,
    footer,
    checked,
    titles: checked.map((id) => pickable.get(id)!.title),
  };
}

/**
 * Add to <block>: each checked to-do slotted into the block for its date,
 * after the last, in the list's order (C-USE-block-view-todos-pool-5). The
 * length stays the slot's to set; null reads 5 min (D-USE-87).
 */
export function placeTodosInputs(
  view: BlockView,
  todoIds: readonly string[],
): PlaceSlotInput[] {
  const from = todosBlock(view).nextSortOrder;
  return todoIds.map((todoId, index) => ({
    blockId: view.block.block.id,
    onDate: view.day.date ?? "",
    sortOrder: from + index,
    todoId,
  }));
}

/**
 * A drop among the to-dos: the slots' sort orders dealt out again in the new
 * order, only the slots whose place changed. Bands are not slots and are left
 * out of `ids`.
 */
export function todoOrderWrites(
  rows: readonly { id: string; sortOrder: number }[],
  ids: readonly string[],
): { slotId: string; sortOrder: number }[] {
  const known = new Map(rows.map((row) => [row.id, row.sortOrder]));
  const ordered = ids.filter((id) => known.has(id));
  const places = ordered.map((id) => known.get(id)!).sort((a, b) => a - b);
  // Equal places (a fixture's) are spread so the order holds.
  const spread = places.map((place, index) =>
    index > 0 && place <= places[index - 1]! ? places[index - 1]! + 1 : place,
  );
  for (let i = 1; i < spread.length; i++) {
    if (spread[i]! <= spread[i - 1]!) spread[i] = spread[i - 1]! + 1;
  }
  return ordered.flatMap((slotId, index) =>
    known.get(slotId) === spread[index]
      ? []
      : [{ slotId, sortOrder: spread[index]! }],
  );
}
