import type { WorkTier } from "@syn/types";
import type { ClientRecord, SlotRecord, WorkItemRecord } from "@syn/validators";
import type { PriorityLevel, WorkRowView } from "@/components/work";
import {
  rangeWords,
  SIZE_RANGE,
  sizeWords,
} from "@/components/work/add/new-task/form";
import type { LinearIssueJoin } from "@/lib/data/integration-records";
import { TIER_WORDS, type WeekDayView } from "@/lib/data/week-view";
import { DESK_COPY as COPY } from "./copy";

/**
 * The opened day's tiers (USE-58; opened-day.md): the date's work slots in
 * the Week's order, each as USE-10's row in the locked anatomy. The first
 * undone item, Urgent to Stretch then tier order, keeps the card's shade
 * (D-USE-102): Next's place on that day, not Next, so it has no Start or
 * Done. Nothing fires on a day not today, so no row is firing. Urgent shows
 * only when it holds something; the rest always, empty ones with their add
 * row. Pure, so a test reads what the screen draws.
 */

export const OPENED_TIERS: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];

export interface OpenedTier {
  tier: WorkTier;
  word: string;
  rows: WorkRowView[];
}

export interface OpenedDayInput {
  day: WeekDayView;
  workItems: readonly WorkItemRecord[];
  slots: readonly SlotRecord[];
  clientFor: (item: WorkItemRecord) => ClientRecord | null;
  issueFor: (item: WorkItemRecord) => LinearIssueJoin | null;
}

/** Linear's 1 to 4 (0 is none). */
const PRIORITY: Record<number, PriorityLevel> = {
  1: "urgent",
  2: "high",
  3: "normal",
  4: "low",
};

function lengthOf(item: WorkItemRecord): string | null {
  const preset = item.size ? SIZE_RANGE[item.size] : null;
  const min = item.lengthMinMin ?? preset?.min ?? null;
  const max = item.lengthMaxMin ?? preset?.max ?? null;
  return rangeWords(min, max) || null;
}

export function openedDayTiers(input: OpenedDayInput): OpenedTier[] {
  const items = new Map(input.workItems.map((item) => [item.id, item]));
  const slots = new Map(input.slots.map((slot) => [slot.id, slot]));
  let nextTaken = false;

  return OPENED_TIERS.flatMap((tier) => {
    const rows = input.day.cells[tier].flatMap((chip): WorkRowView[] => {
      const item = items.get(chip.workItemId);
      if (!item) return [];
      const done = slots.get(chip.id)?.doneAt != null;
      const isNext = !done && !nextTaken;
      if (isNext) nextTaken = true;
      const client = input.clientFor(item);
      const issue = input.issueFor(item);
      const identifier = issue?.identifier ?? item.linearIdentifier;
      const level = issue ? PRIORITY[issue.priority] : undefined;
      return [
        {
          id: chip.id,
          title: item.title,
          emoji: chip.emoji,
          form: done ? "done" : isNext ? "next" : "idle",
          client: client
            ? {
                letter: client.name.slice(0, 1).toUpperCase(),
                name: client.name,
                hue: client.colorKey,
              }
            : null,
          project: issue?.project
            ? { emoji: issue.project.icon ?? null, name: issue.project.name }
            : null,
          identifier,
          noLinear: identifier === null ? COPY.noLinear : null,
          priority: level ? { level, word: COPY.priority[level] } : null,
          size: item.size ? sizeWords(item.size) : null,
          labels: (issue?.labels ?? []).map((label) => ({
            name: label.name,
            color: label.color,
          })),
          session: chip.session
            ? COPY.session(chip.session.n, chip.session.of)
            : null,
          worked: null,
          length: lengthOf(item),
          firing: null,
          doneRecord: null,
          subIssues: null,
        },
      ];
    });
    if (tier === "urgent" && rows.length === 0) return [];
    return [{ tier, word: TIER_WORDS[tier], rows }];
  });
}
