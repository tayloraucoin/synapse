import type { PoolPanelView } from "@/lib/data/pool-view";
import { SIZE_WORDS } from "@/lib/data/week-view";
import type { SpreadCard } from "./spread-dialog";

/**
 * The dialog's item card from the pool panel's rows: the emoji, the title and
 * "Personal · 🧠 Synapse · SYN-218 · 8 Huge" (the group's head, the line's
 * project, the ID and the size word).
 */
export function spreadCardOf(
  view: PoolPanelView | null,
  workItemId: string,
): SpreadCard | null {
  for (const group of view?.groups ?? []) {
    for (const line of group.lines) {
      const row = line.rows.find((r) => r.workItemId === workItemId);
      if (!row) continue;
      const project = line.project
        ? [line.project.emoji, line.project.name].filter(Boolean).join(" ")
        : null;
      return {
        emoji: row.emoji,
        title: row.title,
        meta: [
          group.head.name,
          project,
          row.identifier,
          row.sizeKey ? SIZE_WORDS[row.sizeKey] : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    }
  }
  return null;
}
