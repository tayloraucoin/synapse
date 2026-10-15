import type { NEW_BLOCK_KINDS } from "@syn/constants";
import type { IconValue } from "@syn/types";
import {
  clockFromMinutes,
  clockMinutes,
  eventLanding,
  overlaps,
  presetRule,
  reflowItems,
  weekdayIndex,
  type RepeatPreset,
} from "@syn/utils";
import type { NewBlockInput, NewTransitionInput } from "@syn/validators";
import { BLOCK_HUE } from "../block-hue";
import { NEW_BLOCK_COPY as COPY, clock } from "./copy";

/**
 * The New block sheet's form (USE-46; set-my-days/new-block-sheet/), pure:
 * its state and the actions on it, the Repeats presets worded from the
 * start date, the scope line, the consequence line, and the write it sends.
 * The sheet holds a `NewBlockForm` in a reducer and reads every line here.
 *
 * THE NAME FOLLOWS THE KIND until it is typed over: picking a kind fills the
 * kind's name while `nameTyped` is false. Typing sets it; clearing the field
 * unsets it again, so the next kind picked refills the name (invalid.md).
 *
 * ENDS, NEVER LENGTH (D-USE-34): the form holds Starts and Ends and the
 * length is read from them. Moving Starts keeps the length [ASSUMPTION: as
 * Google Calendar does], so Ends follows; moving Ends sets the length.
 *
 * A TRANSITION has no kind and no Repeats and takes its block's colour. Its
 * time inside a block places it there, asking nothing (round 5): an
 * `in_block` item of that block. Outside every block it is a block of kind
 * `transition` between blocks, on the sheet's own day.
 */

export type NewBlockKind = (typeof NEW_BLOCK_KINDS)[number];
export type NewBlockMode = "block" | "transition";
export type WorkFill = "tasks_for_the_day" | "set_items";

/** Where the sheet opened: a usual weekday, or a date of This week. */
export interface NewBlockScope {
  /** Monday 0 … Sunday 6. */
  weekday: number;
  /** The date in a dated week; null in the usual week. */
  date: string | null;
  /**
   * The date the Repeats presets are worded from and anchored on: the date,
   * or in the usual week this week's date of the weekday (repeats-menu.md).
   */
  ruleDate: string;
}

/** One block of the day, as the sheet weighs a new one against it. */
export interface DayBlock {
  id: string;
  name: string;
  kind: string;
  startsAt: string;
  endsAt: string;
  checklist: boolean;
  /** In the day's order. */
  items: readonly {
    id: string;
    title: string;
    atTime: string | null;
    lengthMin: number | null;
  }[];
}

export interface NewBlockDay {
  scope: NewBlockScope;
  /** Up at, so "after Orient" can be said; null when the day is not set. */
  upAt: string | null;
  blocks: readonly DayBlock[];
}

export interface NewBlockForm {
  mode: NewBlockMode;
  kind: NewBlockKind;
  name: string;
  /** Typed over: the kind no longer fills it. */
  nameTyped: boolean;
  /** Emptied by hand (invalid.md's line); a name typed or filled ends it. */
  nameCleared: boolean;
  icon: IconValue | null;
  startsAt: string;
  endsAt: string;
  repeat: RepeatPreset;
  checklist: boolean;
  meal: boolean;
  fill: WorkFill;
  /** Meal topics offered at this meal (meal.md). */
  topics: readonly string[];
}

/** The kinds' words: the chips, and the name a kind fills in. */
export const KIND_WORDS: Record<NewBlockKind, string> = {
  wellness: "Wellness",
  training: "Training",
  work: "Work",
  life: "Life",
  todos: "To-dos",
  break: "Break",
  evening: "Evening",
};

/** A transition's default length (D-USE-34). */
export const TRANSITION_MIN = 15;
/** A new block's default length (N2). */
export const BLOCK_MIN = 60;

const DAY_END = 24 * 60;

/* ---- Opening ---- */

export interface NewBlockStart {
  mode: NewBlockMode;
  startsAt: string;
  /** Absent: an hour for a block, 15 minutes for a transition. */
  endsAt?: string;
  kind?: NewBlockKind;
}

function plus(start: string, minutes: number): string {
  return clockFromMinutes(Math.min(clockMinutes(start) + minutes, DAY_END));
}

/**
 * The form as the sheet opens. Repeats defaults to weekly on its day from
 * the usual week and to Does not repeat from This week (D-USE-80).
 * [ASSUMPTION] With no kind given, Wellness is picked, as the empty day's
 * frame opens, so the sheet never opens nameless.
 */
export function openForm(start: NewBlockStart, scope: NewBlockScope): NewBlockForm {
  const kind = start.kind ?? "wellness";
  const length = start.mode === "transition" ? TRANSITION_MIN : BLOCK_MIN;
  return {
    mode: start.mode,
    kind,
    name: start.mode === "transition" ? "" : KIND_WORDS[kind],
    nameTyped: false,
    nameCleared: false,
    icon: null,
    startsAt: start.startsAt,
    endsAt: start.endsAt ?? plus(start.startsAt, length),
    repeat: scope.date === null ? "weekly" : "none",
    checklist: false,
    meal: false,
    fill: "tasks_for_the_day",
    topics: [],
  };
}

/* ---- Actions ---- */

export type NewBlockAction =
  | { type: "kind"; kind: NewBlockKind }
  | { type: "name"; name: string }
  | { type: "icon"; icon: IconValue | null }
  | { type: "starts"; startsAt: string }
  | { type: "ends"; endsAt: string }
  | { type: "repeat"; repeat: RepeatPreset }
  | { type: "checklist"; on: boolean }
  | { type: "meal"; on: boolean }
  | { type: "fill"; fill: WorkFill }
  | { type: "topic"; id: string };

export function reduceForm(
  form: NewBlockForm,
  action: NewBlockAction,
): NewBlockForm {
  switch (action.type) {
    case "kind": {
      const fills = !form.nameTyped || form.name.trim() === "";
      return {
        ...form,
        kind: action.kind,
        ...(fills
          ? { name: KIND_WORDS[action.kind], nameTyped: false, nameCleared: false }
          : {}),
        // Meal belongs to Break; Checklist to the kinds that show it.
        meal: action.kind === "break" ? form.meal : false,
        checklist: hasChecklist(action.kind) ? form.checklist : false,
      };
    }
    case "name": {
      const empty = action.name.trim() === "";
      return {
        ...form,
        name: action.name,
        nameTyped: !empty,
        nameCleared: empty,
      };
    }
    case "icon":
      return { ...form, icon: action.icon };
    case "starts": {
      if (action.startsAt === "") return form;
      const length = lengthMin(form);
      return {
        ...form,
        startsAt: action.startsAt,
        endsAt: plus(action.startsAt, length > 0 ? length : 1),
      };
    }
    case "ends":
      return action.endsAt === "" ? form : { ...form, endsAt: action.endsAt };
    case "repeat":
      return { ...form, repeat: action.repeat };
    case "checklist":
      return { ...form, checklist: action.on };
    case "meal":
      return { ...form, meal: action.on };
    case "fill":
      return { ...form, fill: action.fill };
    case "topic":
      return {
        ...form,
        topics: form.topics.includes(action.id)
          ? form.topics.filter((id) => id !== action.id)
          : [...form.topics, action.id],
      };
  }
}

/* ---- What the sheet shows ---- */

/** The kinds that offer "Checklist, no times" (Life and Evening [ASSUMPTION]). */
export function hasChecklist(kind: NewBlockKind): boolean {
  return (
    kind === "wellness" ||
    kind === "training" ||
    kind === "life" ||
    kind === "evening"
  );
}

/** Minutes from Starts to Ends; 0 or less when Ends is not after Starts. */
export function lengthMin(form: Pick<NewBlockForm, "startsAt" | "endsAt">): number {
  return clockMinutes(form.endsAt) - clockMinutes(form.startsAt);
}

/** "20 min", "1 h", "3 h", "1 h 30 min"; empty when Ends is not after Starts. */
export function lengthWords(minutes: number): string {
  if (minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function hasName(form: NewBlockForm): boolean {
  return form.name.trim() !== "";
}

/** The block a time falls in: start inside its span; a checklist never. */
export function blockAt(
  at: string,
  blocks: readonly DayBlock[],
): DayBlock | null {
  const minute = clockMinutes(at);
  return (
    blocks.find(
      (block) =>
        !block.checklist &&
        clockMinutes(block.startsAt) <= minute &&
        minute < clockMinutes(block.endsAt),
    ) ?? null
  );
}

/** Where a transition goes: inside the block its start falls in, or between blocks. */
export function transitionHome(
  form: NewBlockForm,
  day: NewBlockDay,
): DayBlock | null {
  return form.mode === "transition" ? blockAt(form.startsAt, day.blocks) : null;
}

export interface RepeatOption {
  preset: RepeatPreset;
  label: string;
}

const WEEKDAYS = COPY.weekdays;
const NTH = ["first", "second", "third", "fourth"] as const;

/** Google Calendar's presets, worded from the start date (D-USE-80). */
export function repeatOptions(ruleDate: string): RepeatOption[] {
  const weekday = WEEKDAYS[weekdayIndex(ruleDate)];
  const day = Number(ruleDate.slice(8, 10));
  const month = COPY.months[Number(ruleDate.slice(5, 7)) - 1];
  const nth = Math.ceil(day / 7);
  const nthWord = nth === 5 ? "last" : NTH[nth - 1];
  return [
    { preset: "none", label: COPY.repeats.none },
    { preset: "daily", label: COPY.repeats.daily },
    { preset: "weekly", label: `Weekly on ${weekday}` },
    { preset: "monthly", label: `Monthly on the ${nthWord} ${weekday}` },
    { preset: "annually", label: `Annually on ${day} ${month}` },
    { preset: "weekdays", label: COPY.repeats.weekdays },
  ];
}

export function repeatLabel(form: NewBlockForm, ruleDate: string): string {
  return (
    repeatOptions(ruleDate).find((option) => option.preset === form.repeat)
      ?.label ?? COPY.repeats.none
  );
}

/** The caption over the title. */
export function scopeLine(form: NewBlockForm, day: NewBlockDay): string {
  const { scope } = day;
  const home = transitionHome(form, day);
  const place =
    scope.date === null
      ? `Usual ${WEEKDAYS[scope.weekday]}`
      : COPY.shortDate(scope.date);
  if (home !== null) return `${place} · inside ${home.name}`;
  if (scope.date !== null) return `${place} · this date only`;
  // An empty usual day says only which weekday it fills.
  if (day.blocks.length === 0) return `Every ${WEEKDAYS[scope.weekday]}`;
  return `${place} · every week`;
}

/** "Clay, Training's colour", or a transition's "Takes Training's colour". */
export function colourLine(form: NewBlockForm, day: NewBlockDay): {
  hue: (typeof BLOCK_HUE)[keyof typeof BLOCK_HUE];
  text: string;
} {
  if (form.mode === "transition") {
    const home = transitionHome(form, day);
    if (home !== null) {
      const hue = BLOCK_HUE[home.kind as keyof typeof BLOCK_HUE] ?? "amber";
      return { hue, text: `Takes ${possessive(home.name)} colour` };
    }
    return { hue: BLOCK_HUE.transition, text: COPY.transitionColour };
  }
  const hue = BLOCK_HUE[form.kind];
  return {
    hue,
    text: `${COPY.hueNames[hue]}, ${possessive(KIND_WORDS[form.kind])} colour`,
  };
}

/** "Training's", "Wellness's"; the plural To-dos takes "To-dos'" (Gloss). */
function possessive(name: string): string {
  return name === KIND_WORDS.todos ? `${name}'` : `${name}'s`;
}

/** The block a new one goes after: the latest to end by its start, else Orient. */
export function blockBefore(
  startsAt: string,
  day: NewBlockDay,
): string | null {
  const start = clockMinutes(startsAt);
  let best: DayBlock | null = null;
  for (const block of day.blocks) {
    if (block.checklist) continue;
    const end = clockMinutes(block.endsAt);
    if (end > start) continue;
    if (best === null || end > clockMinutes(best.endsAt)) best = block;
  }
  if (best !== null) return best.name;
  if (day.upAt !== null && start >= clockMinutes(day.upAt)) return COPY.orient;
  return null;
}

/** The block a time after it starts falls before: for "between". */
function blockAfter(startsAt: string, day: NewBlockDay): string | null {
  const start = clockMinutes(startsAt);
  let best: DayBlock | null = null;
  for (const block of day.blocks) {
    if (block.checklist) continue;
    const begins = clockMinutes(block.startsAt);
    if (begins < start) continue;
    if (best === null || begins < clockMinutes(best.startsAt)) best = block;
  }
  return best?.name ?? null;
}

export type LineKind = "goes" | "clash" | "invalid" | "error";

export interface ConsequenceLine {
  kind: LineKind;
  /** Ink for a clash or an error; muted otherwise. Never red. */
  tone: "muted" | "ink";
  text: string;
}

/** The first block the new one shares time with (D-USE-33), or none. */
export function clashWith(
  form: NewBlockForm,
  day: NewBlockDay,
): DayBlock | null {
  if (form.mode === "transition" || form.checklist) return null;
  if (lengthMin(form) <= 0) return null;
  const timed = day.blocks.filter((block) => !block.checklist);
  const pairs = overlaps([
    { id: "", startsAt: form.startsAt, endsAt: form.endsAt },
    ...timed.map((block) => ({
      id: block.id,
      startsAt: block.startsAt,
      endsAt: block.endsAt,
    })),
  ]);
  const pair = pairs.find((p) => p.a === "" || p.b === "");
  if (pair === undefined) return null;
  const other = pair.a === "" ? pair.b : pair.a;
  return timed.find((block) => block.id === other) ?? null;
}

/** What opens once it is added, as the end of the "Goes in" line. */
function opensWords(form: NewBlockForm): string | null {
  if (form.meal) return null;
  if (form.kind === "work") {
    return form.fill === "set_items" ? COPY.opens.setWork : COPY.opens.tiers;
  }
  return COPY.opens.empty;
}

function sentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * The line above the primary: where it goes and what opens next, or the
 * clash, invalid or error line in its place. `failed` is the add that did
 * not go through; it outranks everything, and keeps what was typed.
 */
export function consequenceLine(
  form: NewBlockForm,
  day: NewBlockDay,
  failed: boolean,
): ConsequenceLine {
  if (failed) return { kind: "error", tone: "ink", text: COPY.notAdded };
  if (!hasName(form)) {
    return {
      kind: "invalid",
      tone: "muted",
      text: form.mode === "transition" ? COPY.invalidTransition : COPY.invalid,
    };
  }

  const start = clock(form.startsAt);
  const end = clock(form.endsAt);

  if (form.mode === "transition") {
    const home = transitionHome(form, day);
    if (home !== null) {
      const landing = eventLanding({
        event: { startsAt: form.startsAt, endsAt: form.endsAt },
        blocks: [{ ...home, items: home.items }],
      });
      const moved = landing.moves[0];
      const title = home.items.find((item) => item.id === moved?.id)?.title;
      const moves =
        moved === undefined || title === undefined
          ? ""
          : ` ${title} moves to ${clock(moved.to)}${landing.moves.length > 1 ? COPY.restFollow : "."}`;
      return {
        kind: "goes",
        tone: "muted",
        text: `${start} falls in ${home.name}, so it goes inside ${home.name}.${moves}`,
      };
    }
    // [ASSUMPTION] transition.md's undrawn line between blocks.
    const before = blockBefore(form.startsAt, day);
    const after = blockAfter(form.startsAt, day);
    const text =
      before !== null && after !== null
        ? `Goes in between ${before} and ${after}, ${start} to ${end}.`
        : before !== null
          ? `Goes in after ${before}, ${start} to ${end}.`
          : `Goes in ${start} to ${end}.`;
    return { kind: "goes", tone: "muted", text };
  }

  const clash = clashWith(form, day);
  if (clash !== null) {
    return {
      kind: "clash",
      tone: "ink",
      text: `Overlaps ${clash.name}, ${clock(clash.startsAt)} to ${clock(clash.endsAt)}. Adding still works: the two sit side by side, and ${clash.name} keeps its time.`,
    };
  }

  const weekday = WEEKDAYS[weekdayIndex(day.scope.ruleDate)];
  const weekly = form.repeat === "weekly";

  if (form.checklist) {
    const where = weekly ? `on ${weekday}s ` : "";
    return {
      kind: "goes",
      tone: "muted",
      text: `Goes in ${where}in the All day strip, above the rail. ${COPY.setATimeLater}`,
    };
  }

  const after = blockBefore(form.startsAt, day);
  if (form.kind === "todos") {
    const lead = weekly
      ? `Goes in on ${weekday}s, ${start} to ${end}`
      : `Goes in ${start} to ${end}`;
    return {
      kind: "goes",
      tone: "muted",
      text: `${lead}${after === null ? "" : `, after ${after}`}. What isn't done by ${end} goes back to To-dos.`,
    };
  }

  const opens = opensWords(form);
  if (weekly) {
    const lead = `Goes in on ${weekday}s, ${start} to ${end}${after === null ? "" : `, after ${after}`}.`;
    return {
      kind: "goes",
      tone: "muted",
      text: opens === null ? lead : `${lead} ${sentence(opens)}`,
    };
  }
  const lead =
    after === null
      ? `Goes in ${start} to ${end}`
      : `Goes in after ${after}, ${start} to ${end}`;
  return {
    kind: "goes",
    tone: "muted",
    text: opens === null ? `${lead}.` : `${lead}, and ${opens}`,
  };
}

/* ---- The write ---- */

/** A checklist has no times: it runs the whole date, in the All day strip. */
const ALL_DAY = { startsAt: "00:00", endsAt: "24:00" } as const;

export type NewBlockWrite =
  | { method: "createBlock"; input: NewBlockInput }
  | {
      method: "createTransition";
      input: NewTransitionInput;
      /**
       * Inside a block: the block's items in their new order, the transition
       * (`null` until it has an id) where its time puts it.
       */
      order?: { blockId: string; ids: (string | null)[] };
    };

function repeatFields(form: NewBlockForm, scope: NewBlockScope) {
  const rrule = presetRule(form.repeat, scope.ruleDate);
  return rrule === null
    ? { rrule: null, onDate: scope.date ?? scope.ruleDate }
    : { rrule, onDate: null };
}

/**
 * The write the primary sends, shaped for `newBlockInput` or
 * `newTransitionInput`; the server parses it again. Does not repeat from
 * the usual week [ASSUMPTION] lands on this week's date of the weekday.
 */
export function newBlockWrite(form: NewBlockForm, day: NewBlockDay): NewBlockWrite {
  const name = form.name.trim();
  const { scope } = day;

  if (form.mode === "transition") {
    const home = transitionHome(form, day);
    if (home !== null) {
      // Before the first item that would start at or after it.
      const at = clockMinutes(form.startsAt);
      const planned = plannedStarts(home);
      const index = home.items.findIndex(
        (item) => (planned.get(item.id) ?? 0) >= at,
      );
      const insertAt = index === -1 ? home.items.length : index;
      const ids: (string | null)[] = home.items.map((item) => item.id);
      ids.splice(insertAt, 0, null);
      return {
        method: "createTransition",
        input: {
          placement: "in_block",
          blockId: home.id,
          name,
          icon: form.icon,
          atTime: form.startsAt,
          lengthMin: Math.max(1, lengthMin(form)),
          meal: form.meal,
          sortOrder: insertAt,
        },
        order: { blockId: home.id, ids },
      };
    }
    return {
      method: "createTransition",
      input: {
        placement: "between_blocks",
        name,
        icon: form.icon,
        color: null,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        ...repeatFields({ ...form, repeat: scope.date === null ? "weekly" : "none" }, scope),
        checklist: false,
        meal: form.meal,
        notify: false,
      },
    };
  }

  const fill =
    form.kind === "work"
      ? form.fill
      : form.kind === "todos"
        ? "from_todos"
        : form.kind === "break"
          ? null
          : "set_items";
  return {
    method: "createBlock",
    input: {
      kind: form.kind,
      name,
      icon: form.icon,
      color: null,
      ...(form.checklist
        ? ALL_DAY
        : { startsAt: form.startsAt, endsAt: form.endsAt }),
      ...repeatFields(form, scope),
      fill,
      checklist: form.checklist,
      meal: form.kind === "break" && form.meal,
      notify: false,
    },
  };
}

/** Each item's planned start in its block, as the column lays them. */
function plannedStarts(block: DayBlock): Map<string, number> {
  const { placed } = reflowItems({
    startsAt: block.startsAt,
    endsAt: block.endsAt,
    items: block.items,
    bands: [],
  });
  return new Map(placed.map((p) => [p.id, clockMinutes(p.startsAt)]));
}
