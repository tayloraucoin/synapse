/**
 * LaneHeader — a group's head on the board (Workflow UX v0.1 §3.5, WF-01, §9).
 *
 * Disclosure (44px, *Collapse {name}* / *Expand {name}*) · the group's 2px hue
 * edge at the category 500 · the name at row-title size · the lane's words ·
 * the `menu` slot. The hue is recognition at the edge of vision and never the
 * carrier: the name is always beside it.
 *
 * A FOLDED LANE STILL TELLS THE TRUTH about what is inside: the firing mark if
 * a task in it is firing, the word *next* if next is inside. Expanded, both
 * are on the rows instead, so the head shows neither. *first today* shows in
 * both states. The caller computes all three; the head decides nothing.
 *
 * `plain` is the lane *No group*: no hue edge, no menu, no handle — it cannot
 * be renamed, coloured, pinned, archived or reordered (§3.2).
 *
 * `handle` is FLO-9's grip slot. Until it is filled no grip is drawn.
 */
"use client";

import type { CategoryKey } from "@syn/types";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { FiringMark } from "../firing-mark";
import { LANE_HEADER_COPY, type LaneHeaderCopy } from "./copy";

/** Static so Tailwind emits all eight — see CategoryChip. */
const EDGE: Record<CategoryKey, string> = {
  leaf: "bg-cat-leaf-500",
  sky: "bg-cat-sky-500",
  clay: "bg-cat-clay-500",
  rose: "bg-cat-rose-500",
  amber: "bg-cat-amber-500",
  slate: "bg-cat-slate-500",
  plum: "bg-cat-plum-500",
  moss: "bg-cat-moss-500",
};

export interface LaneHeaderProps {
  name: string;
  hue: CategoryKey | null;
  collapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
  firstToday?: boolean;
  /** A task in this lane is firing — shown only while folded. */
  hasFiring?: boolean;
  /** Next is in this lane — shown only while folded. */
  hasNext?: boolean;
  /** An `EllipsesMenu` (*{name} options*). */
  menu?: React.ReactNode;
  /** FLO-9's grip. */
  handle?: React.ReactNode;
  /** The lane *No group*: no hue, no menu, no handle. */
  plain?: boolean;
  copy?: Partial<LaneHeaderCopy>;
  className?: string;
}

export function LaneHeader({
  name,
  hue,
  collapsed,
  onCollapsedChange,
  firstToday = false,
  hasFiring = false,
  hasNext = false,
  menu,
  handle,
  plain = false,
  copy: copyOverride,
  className,
}: LaneHeaderProps) {
  const copy = { ...LANE_HEADER_COPY, ...copyOverride };
  const showMark = collapsed && hasFiring;
  const showNext = collapsed && hasNext;

  return (
    <div
      data-collapsed={collapsed || undefined}
      className={cn("flex min-h-(--row-min) min-w-0 items-center gap-(--space-2) pe-(--space-1)", className)}
    >
      {plain || handle === undefined ? null : <span className="flex shrink-0 items-center">{handle}</span>}

      <button
        type="button"
        aria-expanded={!collapsed}
        aria-label={collapsed ? copy.expand(name) : copy.collapse(name)}
        onClick={() => onCollapsedChange(!collapsed)}
        className={cn(
          "inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius) text-text-secondary",
          "transition-colors duration-(--dur-state) ease-(--ease-settle)",
          "hover:bg-fill-muted hover:text-ink",
        )}
      >
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-(--dur-sheet) ease-(--ease-settle)",
            collapsed && "-rotate-90",
          )}
        />
      </button>

      {plain || hue === null ? null : (
        <span aria-hidden="true" className={cn("h-5 w-0.5 shrink-0 rounded-(--radius-full)", EDGE[hue])} />
      )}

      <Text as="span" variant="row-title" weight={500} truncate className="min-w-0">
        {name}
      </Text>

      {firstToday || showMark || showNext ? (
        <span className="flex shrink-0 items-center gap-(--space-2)">
          {firstToday ? (
            <Text as="span" variant="secondary" tone="secondary">
              {copy.firstToday}
            </Text>
          ) : null}
          {showMark ? <FiringMark breathing /> : null}
          {showNext ? (
            <Text as="span" variant="secondary" weight={500}>
              {copy.next}
            </Text>
          ) : null}
        </span>
      ) : null}

      {plain || menu === undefined ? null : <span className="ms-auto flex shrink-0 items-center">{menu}</span>}
    </div>
  );
}
