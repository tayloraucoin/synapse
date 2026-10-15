import { clockToMinutes } from "../time";

/**
 * The Ready, go welcome (USE-43; interactions/ready-go/, D-USE-71): what the
 * screen between Review the day and Now shows, from the date's blocks and
 * the minute. Pure: no timer, nothing moves on by itself; only Start leaves.
 *
 * The heading is "First", or "Now" once a block is under way (late wake).
 * Up to three next blocks (two on the first go ever, to make room for the
 * tabs' teaching). The button starts the block in hand: before its time
 * ("Planned for"), under way ("Planned from") or the day's list.
 *
 * Never a count, never "late" or "missed": a passed block is only faded.
 */

export interface WelcomeBlock {
  id: string;
  name: string;
  kind: string;
  /** "HH:MM", the date's times; an all-day checklist is 00:00 to 24:00. */
  startsAt: string;
  endsAt: string;
  checklist: boolean;
}

/** A late wake's layout (`layoutFromWake`'s summary fits): folded blocks fade. */
export interface WelcomeLayout {
  folded: readonly string[];
  underWay: string | null;
}

export interface WelcomeRow {
  blockId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  /** The first row: a filled dot and the bold name. */
  lead: boolean;
  /** The block runs now: "under way, until <end>". */
  underWay: boolean;
  /** The day's list: "any order, all day". */
  allDay: boolean;
}

export interface WelcomeSegment {
  blockId: string;
  label: string;
  initial: string;
  kind: string;
  startMin: number;
  endMin: number;
  /** Passed before now: faded, never marked. */
  faded: boolean;
}

export interface WelcomeView {
  heading: "first" | "now";
  rows: WelcomeRow[];
  /** The block Start opens, and how its caption reads; null on an empty day. */
  start: {
    blockId: string;
    name: string;
    startsAt: string;
    form: "early" | "under-way" | "list";
  } | null;
  /** "Today, as I see it": only when Orient's line has words. */
  orientLine: string | null;
  /** "From here, at the bottom": the first go ever only (D-USE-88). */
  teaching: boolean;
  bar: { from: number; to: number; nowMin: number; segments: WelcomeSegment[] };
}

/** The bar runs at least to 17:00 [ASSUMPTION: as drawn, 7:00 to 17:00]. */
export const WELCOME_BAR_END_MIN = 17 * 60;

const isAllDayList = (block: WelcomeBlock) =>
  block.checklist && block.startsAt === "00:00" && block.endsAt === "24:00";

/** The list's name on the welcome: "Sunday" reads "Sunday's list" [ASSUMPTION]. */
function labelOf(block: WelcomeBlock): string {
  return isAllDayList(block) ? `${block.name}'s list` : block.name;
}

export function welcomeView({
  occurrences,
  layout = null,
  now,
  linesToday,
  firstEver,
  isChecklistDay,
}: {
  occurrences: readonly WelcomeBlock[];
  layout?: WelcomeLayout | null;
  /** "HH:MM", the minute on the date. */
  now: string;
  linesToday: string | null;
  firstEver: boolean;
  isChecklistDay: boolean;
}): WelcomeView {
  const nowMin = clockToMinutes(now);
  const blocks = occurrences
    .filter((block) => block.kind !== "orient")
    .slice()
    .sort((a, b) => clockToMinutes(a.startsAt) - clockToMinutes(b.startsAt));
  const folded = new Set(layout?.folded ?? []);
  const passed = (block: WelcomeBlock) =>
    folded.has(block.id) ||
    (!isAllDayList(block) && clockToMinutes(block.endsAt) <= nowMin);
  const runs = (block: WelcomeBlock) =>
    !isAllDayList(block) &&
    clockToMinutes(block.startsAt) <= nowMin &&
    nowMin < clockToMinutes(block.endsAt);

  const list = isChecklistDay ? blocks.find(isAllDayList) : undefined;
  const ahead = blocks.filter(
    (block) => !passed(block) && block !== list,
  );
  const underWay =
    list === undefined
      ? (ahead.find((block) => block.id === layout?.underWay) ??
        ahead.find(runs))
      : undefined;
  const ordered = [...(list ? [list] : []), ...ahead];
  const limit = firstEver ? 2 : 3;
  const rows = ordered.slice(0, limit).map(
    (block, index): WelcomeRow => ({
      blockId: block.id,
      name: labelOf(block),
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      lead: index === 0,
      underWay: block === underWay,
      allDay: block === list,
    }),
  );
  const first = ordered[0];

  const starts = blocks
    .filter((block) => !isAllDayList(block))
    .map((block) => clockToMinutes(block.startsAt));
  const ends = blocks
    .filter((block) => !isAllDayList(block))
    .map((block) => clockToMinutes(block.endsAt));
  const from =
    Math.floor(Math.min(nowMin, ...starts, 7 * 60) / 60) * 60;
  const to = Math.min(
    24 * 60,
    Math.max(WELCOME_BAR_END_MIN, Math.ceil(Math.max(from, ...ends) / 60) * 60),
  );

  return {
    heading: underWay ? "now" : "first",
    rows,
    start: first
      ? {
          blockId: first.id,
          name: labelOf(first),
          startsAt: first.startsAt,
          form:
            first === list
              ? "list"
              : first === underWay
                ? "under-way"
                : "early",
        }
      : null,
    orientLine:
      !firstEver && linesToday !== null && linesToday.trim() !== ""
        ? linesToday.trim()
        : null,
    teaching: firstEver,
    bar: {
      from,
      to,
      nowMin,
      segments: blocks.map((block) => ({
        blockId: block.id,
        label: labelOf(block),
        initial: block.name.trim().charAt(0).toUpperCase(),
        kind: block.kind,
        startMin: Math.max(from, clockToMinutes(block.startsAt)),
        endMin: Math.min(to, clockToMinutes(block.endsAt)),
        faded: passed(block),
      })),
    },
  };
}
