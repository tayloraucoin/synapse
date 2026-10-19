import type { WorkTier } from "@syn/types";
import type { ClientRecord, SlotRecord, WorkItemRecord } from "@syn/validators";
import type { WorkRowView } from "@/components/work";
import type { LinearIssueJoin } from "@/lib/data/integration-records";
import { TIER_WORDS, type WeekDayView } from "@/lib/data/week-view";
import { workRowView } from "@/lib/data/work-row-view";

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
      return [
        workRowView({
          id: chip.id,
          item,
          emoji: chip.emoji,
          form: done ? "done" : isNext ? "next" : "idle",
          session: chip.session,
          client: input.clientFor(item),
          issue: input.issueFor(item),
        }),
      ];
    });
    if (tier === "urgent" && rows.length === 0) return [];
    return [{ tier, word: TIER_WORDS[tier], rows }];
  });
}
