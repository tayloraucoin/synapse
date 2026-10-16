import type { WorkTier } from "@syn/types";
import type { WorkRowView } from "@/components/work/view";
import type { TodayWorkView } from "./today-work";

/**
 * Still firing, from Work (USE-110; interactions/firing.md step 5, D-USE-57):
 * the day's work rows still firing, each with its tier, read from the same
 * view the tiers draw. A firing row was fired and has had neither Bring back
 * nor Done; once its Work block ends it shows on the next block's Now, and
 * leaves the moment it is brought back or done. Nothing here is stored.
 */
export interface StillFiringRow {
  row: WorkRowView;
  tier: WorkTier;
  /** "Primary". */
  word: string;
}

export function stillFiringRows(
  view: Pick<TodayWorkView, "tiers">,
): StillFiringRow[] {
  return view.tiers.flatMap((tier) =>
    tier.rows
      .filter((row) => row.form === "firing")
      .map((row) => ({ row, tier: tier.tier, word: tier.word })),
  );
}
