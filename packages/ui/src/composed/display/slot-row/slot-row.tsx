/**
 * SlotRow — one slot of a block template, as a list row (UX v1.1 §3.11,
 * §3.4, §3.5). The block editor's strip (DYN-8) draws slots as blocks in
 * time; this is the same slot as a row — the compact list the editor shows
 * under 375px, the slot sheet's header, and the first run's *Before work*
 * screen (§4.7) all read it.
 *
 * WHAT A SLOT CARRIES, in v1.1's words: "Between items, the gaps render as
 * thin empty bands with the minutes written in the gutter (*+5*) … A pin
 * shows the anchor glyph and its clock time; opener and closer rows in an
 * opener-pool-closer routine carry a small *opener* / *closer* caption, and
 * pool items sit in a lighter band labelled *decide in the morning*. A
 * one-of group is a single block with two tabs at its top (*meal-prepped 10 ·
 * cook it 30*); the default tab is filled."
 *
 * THE ONE-OF TABS ARE READ-ONLY HERE. Which member is the default is the
 * slot sheet's decision (DYN-8); the row shows it. The whole row is the
 * open target; a `trailing` slot takes the editor's menu.
 */
"use client";

import type { SlotView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { ItemIcon, PinGlyph } from "../item-icon";
import { StateWord } from "../state-word";
import { SLOT_ROW_COPY } from "./copy";

export interface SlotRowProps {
  slot: SlotView;
  onOpen?: (slot: SlotView) => void;
  /** An `EllipsesMenu`, a ghost action — the editor's, not the row's. */
  trailing?: React.ReactNode;
  /** The gap band above the row; off when the strip draws gaps itself. */
  showGap?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SlotRow({
  slot,
  onOpen,
  trailing,
  showGap = true,
  disabled = false,
  className,
}: SlotRowProps) {
  const pool = slot.role === "pool";
  const roleWord = slot.role === "opener" || slot.role === "closer" ? slot.role : null;
  const gap = showGap && slot.gapBeforeMin > 0 && slot.pinnedClock === null ? slot.gapBeforeMin : 0;

  const time =
    slot.pinnedClock !== null
      ? slot.pinnedClock
      : slot.startClock !== null && slot.endClock !== null
        ? `${slot.startClock}–${slot.endClock}`
        : null;

  const label = [
    slot.title,
    SLOT_ROW_COPY.minutes(slot.durationMin),
    slot.pinnedClock === null ? null : SLOT_ROW_COPY.pinnedLabel(slot.pinnedClock),
    roleWord,
    pool ? SLOT_ROW_COPY.decideInTheMorning : null,
    slot.alternates === null
      ? null
      : `${SLOT_ROW_COPY.oneOf}: ${slot.title} ${slot.durationMin} or ${slot.alternates.otherTitle} ${slot.alternates.otherDurationMin}`,
    gap > 0 ? SLOT_ROW_COPY.gapLabel(gap) : null,
  ]
    .filter((part): part is string => part !== null)
    .join(", ");

  const body = (
    <>
      <ItemIcon icon={slot.icon} size={24} />
      <span className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
        {slot.alternates === null ? null : (
          /* The one-of tabs: the default is filled (§3.5). Read-only here. */
          <span
            role="group"
            aria-label={SLOT_ROW_COPY.oneOf}
            className="border-hairline inline-flex w-fit overflow-hidden rounded-(--radius) border text-(length:--fs-caption)"
          >
            <span
              className={cn(
                "px-(--space-2) py-0.5 tabular-nums",
                slot.alternates.isDefault ? "bg-primary text-primary-foreground" : "text-text-secondary",
              )}
            >
              {SLOT_ROW_COPY.tab(slot.title, slot.durationMin)}
            </span>
            <span
              className={cn(
                "border-hairline border-s px-(--space-2) py-0.5 tabular-nums",
                slot.alternates.isDefault ? "text-text-secondary" : "bg-primary text-primary-foreground",
              )}
            >
              {SLOT_ROW_COPY.tab(slot.alternates.otherTitle, slot.alternates.otherDurationMin)}
            </span>
          </span>
        )}
        <span className="flex min-w-0 items-center gap-(--space-1)">
          {slot.pinnedClock === null ? null : <PinGlyph size={12} className="text-text-secondary" />}
          <Text as="span" variant="row-title" weight={500} truncate>
            {slot.title}
          </Text>
        </span>
        <span className="flex flex-wrap items-center gap-(--space-2)">
          {time === null ? null : (
            <Text as="span" variant="secondary" tone="secondary" className="tabular-nums">
              {time}
            </Text>
          )}
          <Text as="span" variant="secondary" tone="secondary" className="tabular-nums">
            {SLOT_ROW_COPY.minutes(slot.durationMin)}
          </Text>
          {roleWord === null ? null : <StateWord kind={roleWord} />}
          {pool ? (
            <Text as="span" variant="caption" tone="secondary">
              {SLOT_ROW_COPY.decideInTheMorning}
            </Text>
          ) : null}
        </span>
      </span>
    </>
  );

  return (
    <li
      data-slot-row
      data-slot-id={slot.id}
      data-role={slot.role}
      className={cn("relative flex flex-col", className)}
    >
      {gap > 0 ? (
        <span
          aria-hidden="true"
          className="flex items-center gap-(--space-2) ps-(--space-4) py-(--space-1)"
        >
          <span className="text-text-secondary w-(--space-6) shrink-0 text-(length:--fs-caption) tabular-nums">
            {SLOT_ROW_COPY.gap(gap)}
          </span>
          <span className="border-hairline flex-1 border-t border-dashed" />
        </span>
      ) : null}

      <span className={cn("flex items-center", pool && "bg-surface/60 rounded-(--radius)")}>
        {onOpen === undefined ? (
          <span className="flex min-h-(--row-min) w-full min-w-0 items-center gap-(--space-3) px-(--space-4) py-(--space-2) text-left">
            {body}
          </span>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onOpen(slot)}
            aria-label={label}
            className={cn(
              "flex min-h-(--row-min) w-full min-w-0 items-center gap-(--space-3) px-(--space-4) py-(--space-2) text-left",
              "hover:bg-surface transition-colors duration-(--dur-state) ease-(--ease-settle)",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
              disabled && "opacity-55",
            )}
          >
            {body}
          </button>
        )}
        {trailing === undefined ? null : <span className="shrink-0 pe-(--space-2)">{trailing}</span>}
      </span>
    </li>
  );
}
