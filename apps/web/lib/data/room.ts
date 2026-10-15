import {
  clockToMinutes,
  cutAndSlide,
  offerLaterStart,
  planRoom,
  slideDay,
  type CutSummary,
  type RoomCandidate,
  type RoomLockReason,
  type RoomPlan,
  type RoomSummary,
  type RoomTake,
  type SlideSummary,
} from "@syn/utils";
import {
  roomCandidatesOf,
  type AppRoomDay,
  type AppRoomSlot,
} from "./room-day";

/**
 * The two sheets' views over the room engine (USE-41; make-room/,
 * later-start/). Pure: every figure a sheet shows is the engine's summary
 * (`planRoom`, `cutAndSlide`, `slideDay`) or a row's own length, read here
 * so a test reads what the sheet reads. The sheets compute nothing.
 */

/* ------------------------------------------------------------ make room -- */

/** What is being added, and where. */
export interface RoomAddition {
  blockId: string;
  title: string;
  lengthMin: number;
  /** "HH:MM", where it lands: "Adding Foam roll, 10 min at 8:45". */
  at: string | null;
}

/** The sheet's two sources (D-USE-11). */
export type RoomSource = "this_block" | "other_blocks";

/** A candidate's key: an item's id, or a gap's block and where. */
export const candidateKey = (candidate: {
  kind: string;
  blockId: string;
  id: string | null;
  where?: "inside" | "after";
}) =>
  candidate.id ??
  `${candidate.blockId}:${candidate.kind}:${candidate.where ?? ""}`;

/** The minutes picked from each candidate, by key. */
export type RoomPicks = ReadonlyMap<string, number>;

export interface MakeRoomRow {
  key: string;
  kind: RoomCandidate["kind"];
  where?: "inside" | "after";
  /** An item's or event's title; a gap's names its neighbour (below). */
  title: string;
  /** A gap after the block: the block it runs up to, "Gap before Breakfast". */
  before: string | null;
  /** The block it sits in, for a gap inside it and the other blocks' rows. */
  blockName: string;
  /** The item's length, the gap's free minutes. */
  lengthMin: number;
  /** The most it may give; 0 when it never gives. */
  gives: number;
  eligible: boolean;
  reason: RoomLockReason | null;
  /** Minutes picked from it; null when not ticked. */
  picked: number | null;
  /** The item's length once the plan takes its minutes: "35 min, now 28 min". */
  nowMin: number | null;
}

export interface MakeRoomView {
  addition: RoomAddition;
  blockName: string;
  source: RoomSource;
  rows: MakeRoomRow[];
  /** "<found> of <needed> min found", the engine's. */
  found: number;
  needed: number;
  /** Make room takes a tap once the plan finds the minutes. */
  ready: boolean;
  plan: RoomPlan<RoomSummary> | null;
}

/** The blocks still on the date, by start, as the engine orders them. */
function liveBlocksOf(day: AppRoomDay) {
  return day.blocks
    .filter((occurrence) => !occurrence.off)
    .sort(
      (a, b) =>
        clockToMinutes(a.startsAt) - clockToMinutes(b.startsAt) ||
        clockToMinutes(a.endsAt) - clockToMinutes(b.endsAt) ||
        a.block.id.localeCompare(b.block.id),
    );
}

function nameOf(day: AppRoomDay, blockId: string): string {
  return (
    day.blocks.find((occurrence) => occurrence.block.id === blockId)?.block
      .name ?? ""
  );
}

function slotOf(day: AppRoomDay, id: string): AppRoomSlot | undefined {
  for (const occurrence of day.blocks) {
    const slot = occurrence.slots.find((one) => one.id === id);
    if (slot) return slot;
  }
  return undefined;
}

/** The block that starts after this one: "Gap before <block>". */
function blockAfter(day: AppRoomDay, blockId: string): string | null {
  const order = liveBlocksOf(day);
  const at = order.findIndex((occurrence) => occurrence.block.id === blockId);
  return at < 0 ? null : (order[at + 1]?.block.name ?? null);
}

/** The picks as the engine's takes. */
export function takesOf(
  candidates: readonly RoomCandidate[],
  picks: RoomPicks,
): RoomTake[] {
  return candidates.flatMap((candidate): RoomTake[] => {
    const minutes = picks.get(candidateKey(candidate));
    if (minutes === undefined || !candidate.eligible) return [];
    if (candidate.kind === "gap") {
      return [
        {
          kind: "gap",
          blockId: candidate.blockId,
          where: candidate.where ?? "inside",
          minutes,
        },
      ];
    }
    if (candidate.kind === "item" && candidate.id !== null) {
      return [
        {
          kind: "item",
          blockId: candidate.blockId,
          slotId: candidate.id,
          minutes,
        },
      ];
    }
    return [];
  });
}

/**
 * The minutes a tick takes: what is still to find, at least one, at most
 * what the candidate gives.
 */
export function minutesForTick(
  candidate: Pick<RoomCandidate, "gives">,
  { needed, picked }: { needed: number; picked: number },
): number {
  return Math.min(candidate.gives, Math.max(1, needed - picked));
}

/**
 * The sheet's opening picks: this block's gaps first, then its items, most
 * given first, each taking what is still to find (the dev note's "gaps
 * first"), until the minutes are found or nothing is left.
 */
export function openingPicks(
  candidates: readonly RoomCandidate[],
  needed: number,
): Map<string, number> {
  const picks = new Map<string, number>();
  let found = 0;
  const own = candidates.filter(
    (candidate) =>
      candidate.source === "this_block" &&
      candidate.eligible &&
      candidate.gives > 0,
  );
  const ordered = [
    ...own.filter((candidate) => candidate.kind === "gap"),
    ...own
      .filter((candidate) => candidate.kind === "item")
      .sort((a, b) => b.gives - a.gives),
  ];
  for (const candidate of ordered) {
    if (found >= needed) break;
    const minutes = minutesForTick(candidate, { needed, picked: found });
    picks.set(candidateKey(candidate), minutes);
    found += minutes;
  }
  return picks;
}

/** A tick on or off: on takes `minutesForTick`, off drops the pick. */
export function togglePick(
  candidates: readonly RoomCandidate[],
  picks: RoomPicks,
  key: string,
  needed: number,
): Map<string, number> {
  const next = new Map(picks);
  if (next.has(key)) {
    next.delete(key);
    return next;
  }
  const candidate = candidates.find((one) => candidateKey(one) === key);
  if (!candidate?.eligible || candidate.gives <= 0) return next;
  const picked = [...next.values()].reduce((sum, minutes) => sum + minutes, 0);
  next.set(key, minutesForTick(candidate, { needed, picked }));
  return next;
}

/** The order the sheet lists: what can give, gaps after items, then what never gives. */
function rowRank(row: MakeRoomRow): number {
  if (!row.eligible) return 2;
  return row.kind === "gap" ? 1 : 0;
}

export function makeRoomView(
  day: AppRoomDay,
  addition: RoomAddition,
  {
    picks,
    source,
    candidates = roomCandidatesOf(day, addition.blockId),
  }: { picks: RoomPicks; source: RoomSource; candidates?: RoomCandidate[] },
): MakeRoomView {
  const takes = takesOf(candidates, picks);
  const result = planRoom(day, {
    blockId: addition.blockId,
    minutes: addition.lengthMin,
    takes,
  });
  const plan = result.kind === "plan" ? result.plan : null;
  const lengths = new Map(
    (plan?.changes ?? []).flatMap((change) =>
      change.kind === "slot_length"
        ? [[change.slotId, change.lengthMin] as const]
        : [],
    ),
  );

  const rows = candidates
    .filter((candidate) => candidate.source === source)
    .map((candidate): MakeRoomRow => {
      const key = candidateKey(candidate);
      const title =
        candidate.kind === "item" && candidate.id !== null
          ? (slotOf(day, candidate.id)?.title ?? "")
          : candidate.kind === "event"
            ? (day.events.find((event) => event.id === candidate.id)?.title ??
              "")
            : candidate.kind === "orient"
              ? nameOf(day, candidate.blockId)
              : "";
      return {
        key,
        kind: candidate.kind,
        ...(candidate.where ? { where: candidate.where } : {}),
        title,
        before:
          candidate.kind === "gap" && candidate.where === "after"
            ? blockAfter(day, candidate.blockId)
            : null,
        blockName: nameOf(day, candidate.blockId),
        lengthMin: candidate.lengthMin,
        gives: candidate.gives,
        eligible: candidate.eligible,
        reason: candidate.reason,
        picked: picks.get(key) ?? null,
        nowMin:
          candidate.id !== null ? (lengths.get(candidate.id) ?? null) : null,
      };
    })
    // A stable sort keeps the engine's order inside each rank.
    .sort((a, b) => rowRank(a) - rowRank(b));

  const found = plan?.summary.found ?? 0;
  return {
    addition,
    blockName: nameOf(day, addition.blockId),
    source,
    rows,
    found,
    needed: addition.lengthMin,
    ready: plan !== null && found >= addition.lengthMin,
    plan,
  };
}

/* ---------------------------------------------------------- later start -- */

/** Opens once a day: from 15 minutes past Up at, never on a day on time. */
export function opensLaterStart({
  wake,
  flagged,
}: {
  wake: { upAt: number; wokeAt: number } | null;
  /** The date's flag: the sheet already opened, or a capture pins it seen. */
  flagged: boolean;
}): boolean {
  return wake !== null && offerLaterStart(wake) && !flagged;
}

export type LaterStartTab = "cut" | "slide";

/** The minutes to find and where the slide starts: after Orient's planned end. */
export interface LaterStartAsk {
  upAt: number;
  wokeAt: number;
  /** "The morning is 70 min short": the wake past Up at. */
  short: number;
  /** Blocks from here slide: Up at plus Orient's minutes. */
  from: number;
}

export interface CutRow {
  id: string;
  title: string;
  lengthMin: number;
  ticked: boolean;
  /** Urgent, done or at a set time: shown, never cut. */
  eligible: boolean;
}

export interface CutBlock {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  rows: CutRow[];
  /** Its drives, which go with the last item: "Drive there and home go with the workout". */
  travel: { count: number; with: string } | null;
  /** Every eligible row ticked: Cut the block reads pressed. */
  allTicked: boolean;
}

export interface CutView {
  blocks: CutBlock[];
  /** More blocks below the ones listed. */
  more: boolean;
  summary: CutSummary | null;
  /** "The rest slides: Breakfast 9:45, Work 10:15." The next two blocks that move. */
  slides: { name: string; at: string }[];
  plan: RoomPlan<CutSummary> | null;
}

/** The blocks Cut some and Slide list: everything after Orient, in order. */
function laterBlocks(day: AppRoomDay, from: number) {
  return liveBlocksOf(day).filter(
    (occurrence) =>
      occurrence.block.kind !== "orient" &&
      clockToMinutes(occurrence.startsAt) >= from,
  );
}

/** "Workout: gym" → "workout": what the drives go with. */
function goesWith(slots: readonly AppRoomSlot[]): string {
  const last = [...slots].reverse().find((slot) => !slot.travel);
  return (last?.title.split(":")[0] ?? "").toLowerCase();
}

export function cutView(
  day: AppRoomDay,
  ask: LaterStartAsk,
  { cuts, shown }: { cuts: ReadonlySet<string>; shown: number },
): CutView {
  const blocks = laterBlocks(day, ask.from);
  const result = cutAndSlide(day, {
    cuts: [...cuts],
    short: ask.short,
    from: ask.from,
  });
  const plan = result.kind === "plan" ? result.plan : null;
  const listed = blocks.slice(0, shown).map((occurrence): CutBlock => {
    const slots = occurrence.slots.filter((slot) => !slot.off);
    const items = slots.filter((slot) => !slot.travel);
    const rows = items.map((slot): CutRow => ({
      id: slot.id,
      title: slot.title,
      lengthMin: slot.lengthMin,
      ticked: cuts.has(slot.id),
      eligible:
        slot.atTime === null && slot.tier !== "urgent" && slot.doneAt == null,
    }));
    const travel = slots.filter((slot) => slot.travel);
    const open = rows.filter((row) => row.eligible);
    return {
      id: occurrence.block.id,
      name: occurrence.block.name,
      startsAt: occurrence.startsAt,
      endsAt: occurrence.endsAt,
      rows,
      travel:
        travel.length > 0
          ? { count: travel.length, with: goesWith(slots) }
          : null,
      allTicked: open.length > 0 && open.every((row) => row.ticked),
    };
  });
  const shownIds = new Set(listed.map((block) => block.id));
  const moves = plan?.summary.moves ?? [];
  const after = moves.filter((move) => !shownIds.has(move.blockId));
  return {
    blocks: listed,
    more: blocks.length > shown,
    summary: plan?.summary ?? null,
    slides: (after.length > 0 ? after : moves).slice(0, 2).map((move) => ({
      name: nameOf(day, move.blockId),
      at: move.to,
    })),
    plan,
  };
}

/** "Cut the block": every eligible row of it ticked, or, when all are, none. */
export function toggleBlockCut(
  view: CutView,
  cuts: ReadonlySet<string>,
  blockId: string,
): Set<string> {
  const block = view.blocks.find((one) => one.id === blockId);
  const next = new Set(cuts);
  if (!block) return next;
  const open = block.rows.filter((row) => row.eligible);
  for (const row of open) {
    if (block.allTicked) next.delete(row.id);
    else next.add(row.id);
  }
  return next;
}

export interface SlideRow {
  id: string;
  name: string;
  kind: string;
  from: string;
  to: string;
}

export interface SlideSetTime {
  id: string;
  title: string;
  at: string;
  /** The block that runs either side of it. */
  block: string;
}

export interface SlideView {
  minutes: number;
  rows: SlideRow[];
  setTimes: SlideSetTime[];
  more: boolean;
  dayEnd: SlideSummary["dayEnd"] | null;
  /** A block would pass midnight: nothing to apply. */
  refused: boolean;
  plan: RoomPlan<SlideSummary> | null;
}

export function slideView(
  day: AppRoomDay,
  ask: LaterStartAsk,
  { shown }: { shown: number },
): SlideView {
  const result = slideDay(day, { from: ask.from, minutes: ask.short });
  const plan = result.kind === "plan" ? result.plan : null;
  const moves = plan?.summary.moves ?? [];
  const rows = moves.slice(0, shown).map((move): SlideRow => {
    const block = day.blocks.find(
      (occurrence) => occurrence.block.id === move.blockId,
    )!.block;
    return {
      id: move.blockId,
      name: block.name,
      kind: block.kind,
      from: move.from,
      to: move.to,
    };
  });
  const listed = new Set(rows.map((row) => row.id));
  const setTimes = (plan?.summary.splits ?? [])
    .filter((split) => listed.has(split.blockId))
    .map((split): SlideSetTime => ({
      id: split.id,
      title:
        day.events.find((event) => event.id === split.id)?.title ??
        slotOf(day, split.id)?.title ??
        "",
      at: split.at,
      block: nameOf(day, split.blockId),
    }));
  return {
    minutes: ask.short,
    rows,
    setTimes,
    more: moves.length > shown,
    dayEnd: plan?.summary.dayEnd ?? null,
    refused: plan === null,
    plan,
  };
}

/** Cut some lists two blocks, Slide four, as drawn; Show later blocks adds two. */
export const LATER_START_SHOWN = { cut: 2, slide: 4, step: 2 } as const;
