import type { SpreadReason } from "@syn/utils";
import type { WhichBlock } from "@/lib/data/use-spread";

/** Spread across the week's words (states/across-the-week/1728.md). */
export const SPREAD_COPY = {
  title: "Spread across the week",
  close: "Close",
  workLeft: "Work left",
  workLeftHelper: "8 Huge means 4 h or more; set the real hours.",
  less: "Half an hour less",
  more: "Half an hour more",
  whichBlock: "Which block",
  blocks: {
    morning: "Morning Work",
    afternoon: "Afternoon Work",
    pick: "Pick blocks",
  } satisfies Record<WhichBlock, string>,
  /** [ASSUMPTION] Pick blocks open: each picked day's Work blocks, one ticked. */
  pickFor: (day: string) => `${day}'s block`,
  days: "Days",
  /** "Tuesday 13, picked"; a day not offered carries its reason as its description. */
  dayName: (weekday: string, date: number, picked: boolean) =>
    `${weekday} ${date}${picked ? ", picked" : ""}`,
  reason: (reason: SpreadReason, which: WhichBlock): string => {
    if (reason === "begun") {
      return which === "pick"
        ? "Its Work has begun"
        : `Its ${SPREAD_COPY.blocks[which]} has begun`;
    }
    if (reason === "gone") return "Gone by";
    if (reason === "holds") return "Already holds this item";
    return which === "afternoon" ? "No Afternoon Work" : "No Work block";
  },
  eachSession: "Each session",
  wholeBlock: "The whole block",
  setLength: "or a set length",
  sessionLength: "Session length",
  shorter: "15 min shorter",
  longer: "15 min longer",
  tier: "Tier",
  whatThisMakes: "What this makes",
  /** [ASSUMPTION] The block's kind as the board words it: "Work 9:30 to 12:00". */
  blockWords: (start: string, end: string) => `Work ${start} to ${end}`,
  shares: (what: string) => `shares with ${what}`,
  /** "Tue 13, Work 9:30 to 12:00, 2 hours 30". */
  rowName: (date: string, block: string, length: string) =>
    `${date}, ${block}, ${length}`,
  sum: (n: number, total: string, left: string | null, which: WhichBlock) =>
    [
      `${n} ${n === 1 ? "session" : "sessions"}, ${total} this week.`,
      left === null
        ? "Nothing stays in the pool."
        : `${left} stays in the pool.`,
      which === "morning"
        ? "Afternoons stay free."
        : which === "afternoon"
          ? "Mornings stay free."
          : null,
    ]
      .filter(Boolean)
      .join(" "),
  /** [ASSUMPTION] No picked day has room. */
  nothing: "Nothing to place: the picked days have no time left in that block.",
  carryOn: "Carry on next week the same way until it's done",
  cancel: "Cancel",
  add: (n: number) =>
    n === 0 ? "Add sessions" : `Add ${n} ${n === 1 ? "session" : "sessions"}`,
} as const;

/**
 * The phone's full sheet and its Days and tier page (USE-78;
 * states/across-the-week/402.md, states/days-and-tier.md): each width's words
 * as drawn, not Gloss's one set.
 */
export const SPREAD_PHONE_COPY = {
  title: "Spread across the week",
  close: "Close",
  /** "Pool · Alder Studio · ALD-22 · 8 Huge". */
  from: "Pool",
  hoursLeft: "Hours left",
  sessionLength: "Session length",
  less: (what: string) => `${what}, half an hour less`,
  more: (what: string) => `${what}, half an hour more`,
  whichBlock: "Which Work block",
  blocks: {
    morning: "Morning",
    afternoon: "Afternoon",
    pick: "Pick per day",
  } satisfies Record<WhichBlock, string>,
  daysAndTier: "Days and tier",
  /** "Tue to Fri · Secondary"; no day picked [ASSUMPTION]: "No days · Secondary". */
  daysAndTierValue: (days: string | null, tier: string) =>
    `${days ?? "No days"} · ${tier}`,
  sessions: "The sessions",
  workEnds: (time: string) => `Work ends ${time}`,
  /** "Tuesday 13, 9:30 to 11:30, Work ends 12:10". */
  rowName: (day: string, start: string, end: string, ends: string) =>
    `${day}, ${start} to ${end}, Work ends ${ends}`,
  carry: (length: string, day: string) =>
    `${length} carry on to ${day}, next week.`,
  /** [ASSUMPTION] Hours left all fit this week (D-USE-106: nothing carries). */
  nothingCarries: "Nothing carries on to next week.",
  /** [ASSUMPTION] No picked day has room. */
  nothing: "No session fits: the picked days have no time left in that block.",
  spreadIt: "Spread it",
  // Days and tier.
  back: "Spread across the week",
  backName: "Back to Spread across the week",
  days: "Days",
  today: (since: string) => `today, already past ${since}`,
  /** Only the first offered row names the block, as drawn. */
  free: (length: string, block: "morning" | "afternoon" | null) =>
    block === null ? `${length} free` : `${length} free in the ${block}`,
  noRoom: "no time left",
  /** "Tuesday 13, 2 hours 10 free in the morning". */
  dayName: (weekday: string, date: number, line: string) =>
    `${weekday} ${date}, ${line}`,
  pickFor: (day: string) => `${day}'s Work block`,
  tier: "Tier, every session",
  done: "Done",
} as const;
