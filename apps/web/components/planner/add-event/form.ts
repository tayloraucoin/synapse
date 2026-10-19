import type { IconValue, WorkTier } from "@syn/types";
import {
  clockFromMinutes,
  clockMinutes,
  eventLanding,
  presetRule,
  reflowItems,
  type RepeatPreset,
} from "@syn/utils";
import { dayEventInput, type DayEventRecord } from "@syn/validators";
import { ADD_EVENT_COPY as COPY } from "./copy";

/**
 * Add event's form (USE-53; interactions/add-event.md, set-my-days'
 * add-event.md), pure: its state and the actions on it, where the event
 * lands and what moves, the landing line above Add, and the write it sends.
 * The phone sheet and the desk popover both hold an `AddEventForm` and
 * read every line here (D-USE-102: two layouts, one form).
 *
 * THE TIME DECIDES (N2, round 2): an event starting inside a block sits in
 * it as a band; in no block it stands as its own small block. There is no
 * choice of place. The block and its moves come from `eventLanding`.
 *
 * NEVER SPLIT (round 8; meeting-inside-a-work-block.md): the band is pinned,
 * and an item that would cross it moves to its end whole. When the block's
 * items no longer fit by its end, Stretch slides first, then Secondary
 * (they leave the column's grid; the Block view still holds them). With
 * nothing left to slide and still no room, Make room decides (USE-35).
 *
 * THE LENGTH, OR ENDS: the form holds Starts and Ends. The phone's Length
 * stepper sets Ends from Starts; moving Starts keeps the length, as the New
 * block sheet's (D-USE-34).
 */

export type EventTag = "work" | "personal";

/** One item of a block as the landing weighs it. */
export interface EventDayItem {
  id: string;
  /** Its name, as the landing line says it. */
  title: string;
  lengthMin: number | null;
  /** A set time pins it; another event in the block is one. */
  atTime: string | null;
  /** A Work slot's tier; null for a set item or a pinned event. */
  tier: WorkTier | null;
}

export interface EventDayBlock {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  /** In the block's order: Work's by tier, then each tier's order. */
  items: EventDayItem[];
}

export interface EventDay {
  date: string;
  /** Monday 0 … Sunday 6. */
  weekday: number;
  blocks: EventDayBlock[];
  /** The day's events, for the blocks they pin. */
  events: readonly Pick<DayEventRecord, "id" | "startsAt" | "endsAt">[];
}

export interface AddEventForm {
  /** The Synapse event being edited; null adds one. */
  id: string | null;
  title: string;
  icon: IconValue | null;
  tag: EventTag;
  startsAt: string;
  endsAt: string;
  notes: string;
  /** A Work event's client (the desk's Client, D-USE-95). */
  clientId: string | null;
  /** The desk's Repeats; the phone's sheet is this date only. */
  repeat: RepeatPreset;
}

/** [ASSUMPTION] Starts and Ends step by 15 (D-USE-19), and so does Length. */
export const EVENT_STEP_MIN = 15;
/** [ASSUMPTION] A new event is 30 minutes, as drawn. */
export const EVENT_DEFAULT_MIN = 30;

export function openForm(
  start: Partial<AddEventForm> & { startsAt: string },
): AddEventForm {
  const startsAt = start.startsAt;
  return {
    id: null,
    title: "",
    icon: null,
    tag: "work",
    notes: "",
    clientId: null,
    repeat: "none",
    endsAt: clockFromMinutes(
      Math.min(24 * 60, clockMinutes(startsAt) + EVENT_DEFAULT_MIN),
    ),
    ...start,
  };
}

/** A Synapse event, filled into the form to edit (D-USE-42). */
export function formOf(event: DayEventRecord): AddEventForm {
  return {
    id: event.id,
    title: event.title,
    icon: event.icon,
    tag: event.tag,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    notes: event.notes ?? "",
    clientId: event.clientId,
    // [ASSUMPTION] A repeating event reopens as "Does not repeat" only when it has none.
    repeat: event.rrule === null ? "none" : "weekly",
  };
}

export type AddEventAction =
  | { type: "title"; title: string }
  | { type: "icon"; icon: IconValue | null }
  | { type: "tag"; tag: EventTag }
  | { type: "starts"; startsAt: string }
  | { type: "ends"; endsAt: string }
  | { type: "length"; lengthMin: number }
  | { type: "notes"; notes: string }
  | { type: "client"; clientId: string | null }
  | { type: "repeat"; repeat: RepeatPreset };

const DAY_END = 24 * 60;

export function lengthMin(form: Pick<AddEventForm, "startsAt" | "endsAt">) {
  return clockMinutes(form.endsAt) - clockMinutes(form.startsAt);
}

export function reduceForm(
  form: AddEventForm,
  action: AddEventAction,
): AddEventForm {
  switch (action.type) {
    case "title":
      return { ...form, title: action.title };
    case "icon":
      return { ...form, icon: action.icon };
    case "tag":
      // Client applies to a Work event only (D-USE-95).
      return {
        ...form,
        tag: action.tag,
        clientId: action.tag === "work" ? form.clientId : null,
      };
    case "starts": {
      const keep = Math.max(EVENT_STEP_MIN, lengthMin(form));
      const start = clockMinutes(action.startsAt);
      return {
        ...form,
        startsAt: action.startsAt,
        endsAt: clockFromMinutes(Math.min(DAY_END, start + keep)),
      };
    }
    case "ends":
      // Ends before Starts is kept as typed and refused in words.
      return { ...form, endsAt: action.endsAt };
    case "length": {
      const start = clockMinutes(form.startsAt);
      const length = Math.max(
        EVENT_STEP_MIN,
        Math.min(DAY_END - start, action.lengthMin),
      );
      return { ...form, endsAt: clockFromMinutes(start + length) };
    }
    case "notes":
      return { ...form, notes: action.notes };
    case "client":
      return { ...form, clientId: action.clientId };
    case "repeat":
      return { ...form, repeat: action.repeat };
  }
}

/** A time moved by a step, kept inside the day. */
export function stepTime(time: string, deltaMin: number): string {
  const next = clockMinutes(time) + deltaMin;
  return clockFromMinutes(Math.max(0, Math.min(DAY_END - 1, next)));
}

export function hasName(form: AddEventForm): boolean {
  return form.title.trim().length > 0;
}

/*
 * ---- Where it lands ----
 */

/** The block's items laid around its bands, Stretch then Secondary sliding. */
export interface BlockLay {
  /** Each item still in the grid and the start it takes. */
  placed: Map<string, string>;
  /** The Stretch and Secondary items slid out of the grid, in that order. */
  slid: string[];
  /** Nothing left to slide and still past the block's end. */
  noRoom: boolean;
}

/** Items that do not slide: Primary, Urgent, a set item, a pinned event. */
const SLIDES: readonly WorkTier[] = ["stretch", "secondary"];

export function layBlock(
  block: Pick<EventDayBlock, "startsAt" | "endsAt" | "items">,
  bands: readonly { startsAt: string; endsAt: string }[],
): BlockLay {
  const end = clockMinutes(block.endsAt);
  const slid: string[] = [];
  const queue = SLIDES.flatMap((tier) =>
    block.items
      .filter((item) => item.tier === tier)
      .reverse()
      .map((item) => item.id),
  );
  for (;;) {
    const kept = block.items.filter((item) => !slid.includes(item.id));
    const lay = reflowItems({
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      items: kept,
      bands,
    });
    const over = lay.placed.some((place) => {
      const item = kept.find((each) => each.id === place.id)!;
      return clockMinutes(place.startsAt) + (item.lengthMin ?? 5) > end;
    });
    const next = queue.shift();
    if (!over || next === undefined) {
      return {
        placed: new Map(lay.placed.map((p) => [p.id, p.startsAt])),
        slid,
        noRoom: over,
      };
    }
    slid.push(next);
  }
}

export interface Landing {
  /** The block its start falls in; null stands as its own block. */
  inside: EventDayBlock | null;
  /** The items it moves that stay in the grid, with their new starts. */
  moves: { id: string; title: string; from: string; to: string }[];
  slid: string[];
  noRoom: boolean;
}

/** The block's items with the day's other events in it pinned at their times. */
function withPinnedEvents(
  block: EventDayBlock,
  day: EventDay,
  except: string | null,
): EventDayBlock {
  const start = clockMinutes(block.startsAt);
  const end = clockMinutes(block.endsAt);
  const pinned = day.events
    .filter((event) => event.id !== except)
    .filter((event) => {
      const at = clockMinutes(event.startsAt);
      return start <= at && at < end;
    })
    .map((event): EventDayItem => ({
      id: event.id,
      title: "",
      lengthMin: clockMinutes(event.endsAt) - clockMinutes(event.startsAt),
      atTime: event.startsAt,
      tier: null,
    }));
  return { ...block, items: [...block.items, ...pinned] };
}

export function landingOf(form: AddEventForm, day: EventDay): Landing {
  const event = { startsAt: form.startsAt, endsAt: form.endsAt };
  const blocks = day.blocks.map((block) =>
    withPinnedEvents(block, day, form.id),
  );
  const landing = eventLanding({ event, blocks });
  const inside =
    landing.inside === null
      ? null
      : (blocks.find((block) => block.id === landing.inside!.id) ?? null);
  if (inside === null) {
    return { inside: null, moves: [], slid: [], noRoom: false };
  }
  const before = layBlock(inside, []);
  const after = layBlock(inside, [event]);
  // Only what stays in the grid is named; a slide is the column's to show.
  const moves = landing.moves.flatMap((move) => {
    const to = after.placed.get(move.id);
    if (to === undefined || !before.placed.has(move.id)) return [];
    const item = inside.items.find((each) => each.id === move.id)!;
    return [{ id: move.id, title: item.title, from: move.from, to }];
  });
  return {
    inside: day.blocks.find((block) => block.id === inside.id) ?? null,
    moves,
    slid: after.slid.filter((id) => !before.slid.includes(id)),
    noRoom: after.noRoom,
  };
}

/*
 * ---- The line above Add ----
 */

export interface LandingLine {
  text: string;
  /** A refusal reads in ink; the landing, muted. */
  tone: "muted" | "ink";
}

/** The schema's words for what it refuses, Name needed apart (the button says it). */
export function refusalOf(form: AddEventForm, date: string): string | null {
  const parsed = dayEventInput.safeParse(eventWrite(form, date));
  if (parsed.success) return null;
  const issue = parsed.error.issues.find((each) => each.path[0] !== "title");
  return issue?.message ?? null;
}

export function landingLine(
  form: AddEventForm,
  day: EventDay,
  layout: "phone" | "desk",
): LandingLine {
  const refused = refusalOf(form, day.date);
  if (refused !== null) return { text: refused, tone: "ink" };
  const landing = landingOf(form, day);
  const block = landing.inside;
  if (block === null) {
    return { text: COPY.ownBlock(form.startsAt, form.endsAt), tone: "muted" };
  }
  const where =
    layout === "phone"
      ? COPY.insideAt(block.name, form.startsAt)
      : COPY.insideSpan(block.name, block.startsAt, block.endsAt);
  const what = landing.noRoom
    ? COPY.noRoom(block.name)
    : landing.moves.length > 0
      ? COPY.moves(landing.moves)
      : layout === "phone"
        ? COPY.nothingMoves
        : COPY.roomUntil(block.endsAt);
  return { text: `${where} ${what}`, tone: "muted" };
}

/** The Toaster after Add (event-inside-work.md, event-own-block.md). */
export function addedWords(form: AddEventForm, landing: Landing): string {
  return landing.inside === null
    ? COPY.addedOwn(form.title.trim())
    : COPY.addedInside(landing.inside.name, form.startsAt);
}

/*
 * ---- The write ----
 */

/**
 * `dayEventInput`'s shape (0013's tag, notes, colour, client and repeat):
 * one date, or a rule from it. Colour stays null, which is plum (D-USE-31).
 */
export function eventWrite(form: AddEventForm, date: string) {
  const rrule = presetRule(form.repeat, date);
  return {
    ...(form.id === null ? {} : { id: form.id }),
    onDate: rrule === null ? date : null,
    rrule,
    title: form.title,
    icon: form.icon,
    startsAt: form.startsAt,
    endsAt: form.endsAt,
    tag: form.tag,
    notes: form.notes.trim() === "" ? null : form.notes.trim(),
    color: null,
    clientId: form.tag === "work" ? form.clientId : null,
  };
}
