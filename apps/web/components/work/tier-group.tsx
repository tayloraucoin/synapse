"use client";

import * as React from "react";
import type { WorkTier } from "@syn/types";
import { Button, cn, GroupHeading, HelperText, HueSquare } from "@syn/ui";
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
 *
 * The edges (USE-61): `helper` is the soft cap's line under the heading,
 * tied to it by `aria-describedby`, never an alert (C-USE-today-9). `add`
 * sits at the heading's trailing edge: "+ Add" on a folded tier on the
 * phone, or at the desk "+ Add to <tier>" shown on hover or focus; its name
 * always carries the tier ("Add to Secondary").
 */
export interface TierGroupAdd {
  /** "+ Add" or "+ Add to Secondary". */
  label: string;
  /** "Add to Secondary". */
  name: string;
  /** "always" on a folded phone heading; "hover" at the desk. */
  reveal: "always" | "hover";
  onAdd: () => void;
}

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
  /** "Two is the usual for Primary." (D-USE-65). */
  helper?: string | null;
  add?: TierGroupAdd | null;
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
  helper = null,
  add = null,
  className,
  ...handlers
}: TierGroupProps) {
  const helperId = React.useId();
  if (tier === "urgent" && rows.length === 0) return null;

  const heading = (
    <GroupHeading
      as={headingAs}
      leading={<HueSquare hue={TIER_HUE[tier]} />}
      aria-describedby={helper ? helperId : undefined}
    >
      {word}
    </GroupHeading>
  );

  return (
    <section
      data-tier-group={tier}
      data-folded={rows.length === 0 ? "" : undefined}
      aria-label={word}
      className={cn("group/tier", className)}
    >
      {add ? (
        <div className="flex items-end justify-between gap-(--space-3)">
          {heading}
          <Button
            variant="ghost"
            size="sm"
            aria-label={add.name}
            onClick={add.onAdd}
            className={cn(
              "text-muted-foreground hover:text-ink",
              add.reveal === "hover" &&
                "opacity-0 group-hover/tier:opacity-100 group-focus-within/tier:opacity-100 focus-visible:opacity-100",
            )}
          >
            {add.label}
          </Button>
        </div>
      ) : (
        heading
      )}
      {helper ? (
        <HelperText id={helperId} className="pb-(--space-2)">
          {helper}
        </HelperText>
      ) : null}
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
