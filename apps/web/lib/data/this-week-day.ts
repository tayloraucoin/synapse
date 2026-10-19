import {
  clockMinutes,
  countSessions,
  fitInBlock,
  topMinutes,
  weekdayIndex,
  type WorkTier,
} from "@syn/utils";
import type { SlotRecord } from "@syn/validators";
import { workBlocksOf } from "./place";
import { clockWords, lengthWords } from "./spread";
import type { SetUpDay } from "./use-set-up-day";
import { TIER_WORDS } from "./week-view";

/**
 * This week's day on the phone, its work parts (USE-81; work/this-week/
 * states/the-day.md, D-USE-107): each Work block of a dated day open to its
 * tiers, worked out. Every tier with its square and word (Urgent only when it
 * holds something); rows with the emoji first and, at the right, the session
 * mark "2 of 3" (D-USE-42, D-USE-102: N the sessions placed so far) or the due
 * words of that day ("due Wed", D-USE-98, from the day shown, never from
 * today); an empty tier's "+ Add to <tier>"; and the fit line, USE-8's
 * `fitInBlock` at the top of every range with the day's events busy, said as
 * a length in ink, never red, never a count (C-USE-this-week-the-day-3).
 * A past day keeps its rows and drops the fit line (past-day.md). Every word
 * is printed here.
 */

export const THIS_WEEK_DAY_WORDS = {
  addTo: (tier: WorkTier) => `+ Add to ${TIER_WORDS[tier]}`,
  due: (day: string) => `due ${day}`,
  dueToday: "due today",
  session: (n: number, of: number) => `${n} of ${of}`,
  sessionName: (n: number, of: number) => `session ${n} of ${of}`,
  /** "Doesn't fit by 40 min at the top of the ranges". */
  over: (by: string) => `Doesn't fit by ${by} at the top of the ranges`,
  /** [ASSUMPTION] Work that fits says where it ends, as the Block panel's. */
  ends: (at: string) => `Work ends ${at} at the top of the ranges`,
  done: "Done",
  pool: "Pool",
  poolName: "Pool, place work on this week's days",
  rowName: (title: string, trail: string | null) =>
    trail === null ? title : `${title}, ${trail}`,
} as const;

const TIERS: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];

export interface WorkPartRow {
  slotId: string;
  workItemId: string;
  emoji: string | null;
  title: string;
  /** "2 of 3" with the link glyph, or "due Wed"; a session mark wins. */
  trail:
    | { kind: "session"; words: string; name: string }
    | { kind: "due"; words: string }
    | null;
  done: boolean;
  /** The row's accessible name. */
  label: string;
}

export interface WorkPartTier {
  tier: WorkTier;
  word: string;
  rows: WorkPartRow[];
  /** "+ Add to Stretch" on a tier with nothing in it. */
  add: string | null;
}

export interface WorkParts {
  blockId: string;
  tiers: WorkPartTier[];
  /** In ink; null on a past day or with nothing slotted. */
  fitLine: string | null;
}

const MIN_MS = 60_000;
const at = (time: string) => new Date(clockMinutes(time) * MIN_MS);

/**
 * The day's Work blocks, each worked out, by block id. `slots` are every
 * slot read (the pool's), so a session counts its siblings on other days.
 */
export function workPartsOf(input: {
  day: SetUpDay;
  slots: readonly SlotRecord[];
  todayKey: string;
}): Map<string, WorkParts> {
  const { day } = input;
  const out = new Map<string, WorkParts>();
  if (day.date === null) return out;
  const dateKey = day.date;
  const items = new Map(day.records.workItems.map((w) => [w.id, w]));
  // The day's own slots count too, should the pool's read not hold them yet.
  const all = new Map(input.slots.map((s) => [s.id, s]));
  for (const b of day.blocks) for (const s of b.slots) all.set(s.id, s);
  const sessions = countSessions(
    [...all.values()].flatMap((s) =>
      s.workItemId === null ? [] : [{ ...s, workItemId: s.workItemId }],
    ),
  );
  const past = dateKey < input.todayKey;
  const busy = day.events.map((e) => ({
    start: at(e.startsAt),
    end: at(e.endsAt),
  }));

  for (const block of workBlocksOf(day)) {
    const work = block.slots.filter(
      (s): s is SlotRecord & { workItemId: string } => s.workItemId !== null,
    );
    const tiers = TIERS.flatMap((tier): WorkPartTier[] => {
      const rows = work
        .filter((s) => (s.tier ?? "primary") === tier)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((slot): WorkPartRow => {
          const item = items.get(slot.workItemId);
          const title = item?.title ?? "";
          const session = sessions.get(slot.id);
          const due = item?.dueOn ? dueWords(item.dueOn, dateKey) : null;
          const trail: WorkPartRow["trail"] =
            session && session.of > 1
              ? {
                  kind: "session",
                  words: THIS_WEEK_DAY_WORDS.session(session.n, session.of),
                  name: THIS_WEEK_DAY_WORDS.sessionName(session.n, session.of),
                }
              : due
                ? { kind: "due", words: due }
                : null;
          const done = slot.doneAt !== null || item?.doneAt != null;
          const spoken =
            trail === null
              ? null
              : trail.kind === "session"
                ? trail.name
                : trail.words;
          return {
            slotId: slot.id,
            workItemId: slot.workItemId,
            emoji: item?.icon?.kind === "emoji" ? item.icon.value : null,
            title,
            trail,
            done,
            label: THIS_WEEK_DAY_WORDS.rowName(
              title,
              done
                ? [spoken, THIS_WEEK_DAY_WORDS.done].filter(Boolean).join(", ")
                : spoken,
            ),
          };
        });
      if (tier === "urgent" && rows.length === 0) return [];
      return [
        {
          tier,
          word: TIER_WORDS[tier],
          rows,
          add: rows.length === 0 ? THIS_WEEK_DAY_WORDS.addTo(tier) : null,
        },
      ];
    });

    const fitSlots = work.map((slot) => {
      const item = items.get(slot.workItemId);
      return {
        tier: slot.tier ?? ("primary" as WorkTier),
        topMin:
          topMinutes({
            lengthMin: slot.lengthMin,
            lengthMaxMin: item?.lengthMaxMin ?? null,
            size: item?.size ?? null,
          }) ?? 0,
      };
    });
    let fitLine: string | null = null;
    if (!past && fitSlots.length > 0) {
      const fit = fitInBlock({
        block: { start: at(block.startsAt), end: at(block.endsAt) },
        slots: fitSlots,
        busy,
        tier: "stretch",
        topMin: 0,
      });
      fitLine = fit.fits
        ? THIS_WEEK_DAY_WORDS.ends(
            clockWords(Math.round(fit.runsTo.getTime() / MIN_MS)),
          )
        : THIS_WEEK_DAY_WORDS.over(lengthWords(fit.overMin ?? 0));
    }
    out.set(block.block.id, { blockId: block.block.id, tiers, fitLine });
  }
  return out;
}

const SHORT_DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayNumber = (dateKey: string) =>
  Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000;

/**
 * "due Wed" from two days ahead of the day shown, never of today (D-USE-98);
 * "due today" on the day; an overdue item names its day. [ASSUMPTION] The
 * phone's row names the weekday where the desk's badge says "tomorrow", as
 * the board's "due Wed" on Tuesday.
 */
export function dueWords(dueOn: string, dateKey: string): string | null {
  const ahead = dayNumber(dueOn) - dayNumber(dateKey);
  if (ahead > 2) return null;
  if (ahead === 0) return THIS_WEEK_DAY_WORDS.dueToday;
  return THIS_WEEK_DAY_WORDS.due(SHORT_DAY[weekdayIndex(dueOn)]!);
}
