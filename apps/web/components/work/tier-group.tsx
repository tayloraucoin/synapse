"use client";

import type * as React from "react";
import type { WorkTier } from "@syn/types";
import { GroupHeading, HueSquare } from "@syn/ui";
import { TIER_HUE, type WorkRowHandlers, type WorkRowView } from "./view";
import { WorkRow } from "./work-row";

/**
 * TierGroup — one tier on Today and Now (USE-10): its heading with the
 * colour square beside the word (D-USE-38), then its work rows in order.
 * Urgent shows only when it holds a row; the others show their heading
 * empty, and the screen decides what goes under it.
 *
 * `afterRow` is the group's one slot under a row: the reminder line under the
 * first firing row (D-USE-47; the pick is USE-8's, the screen passes it).
 * `lifted` stands in a row's place: Next lifted as the card (USE-57), or the
 * running card (USE-59), so the lift never moves an item out of its tier.
 */
export interface TierGroupProps extends WorkRowHandlers {
  tier: WorkTier;
  /** "Primary". */
  word: string;
  rows: WorkRowView[];
  afterRow?: { rowId: string; content: React.ReactNode } | null;
  lifted?: { rowId: string; content: React.ReactNode } | null;
  /** The opened day's rows, with no lead slot (USE-58). */
  planning?: boolean;
  /** Drawn under the heading when the tier holds nothing: "+ Add to Stretch" (USE-58). */
  empty?: React.ReactNode;
  headingAs?: "h2" | "h3";
  className?: string;
}

export function TierGroup({
  tier,
  word,
  rows,
  afterRow = null,
  lifted = null,
  planning = false,
  empty = null,
  headingAs = "h3",
  className,
  ...handlers
}: TierGroupProps) {
  if (tier === "urgent" && rows.length === 0) return null;

  return (
    <section data-tier-group={tier} aria-label={word} className={className}>
      <GroupHeading as={headingAs} leading={<HueSquare hue={TIER_HUE[tier]} />}>
        {word}
      </GroupHeading>
      {rows.length === 0 ? empty : null}
      <ul className="flex flex-col">
        {rows.map((row) => (
          <li key={row.id}>
            {lifted?.rowId === row.id ? (
              lifted.content
            ) : (
              <WorkRow row={row} planning={planning} {...handlers} />
            )}
            {afterRow?.rowId === row.id ? afterRow.content : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
