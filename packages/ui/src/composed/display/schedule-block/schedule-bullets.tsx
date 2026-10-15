/**
 * ScheduleBullets — a block's items as a grid of fixed cells (USE-31;
 * D-USE-7, D-USE-23): each cell 145 px, 8 px across and 4 px down from the
 * next, a 20 px line holding a 6 px dot and the item, or a transition's
 * short dash and its words in muted italic. The last cell may be "+n more".
 *
 * IT NEVER DECIDES WHAT FITS. The caller lays the items with `bulletGrid`
 * (`@syn/utils`) from the block's height and passes only what is shown, with
 * the count of the rest; the cells wrap at the width the same maths assumed.
 * A block is as tall as its time, never as tall as its items.
 *
 * Presentational: the dot's colour comes in as a class (`dotClassName`),
 * so no kind or hue is known here. A bullet with `onOpen` is a button (a
 * shortcut; the block's own button carries the tap, since 20 px is under
 * the target), one without is plain text.
 */
"use client";

import * as React from "react";
import { cn } from "../../../lib/cn";

/** The grid's fixed geometry, shared with the maths that lays it. */
export const BULLET_CELL_PX = 145;
export const BULLET_LINE_PX = 20;
export const BULLET_GAP_X_PX = 8;
export const BULLET_GAP_Y_PX = 4;

export interface ScheduleBullet {
  id: string;
  label: string;
  /** An item has a dot; a transition (a drive, a walk) a dash in italic. */
  tone: "dot" | "transition";
  /** The bullet's own tap (the Item sheet); none, and it is text. */
  onOpen?: () => void;
  /** "<item>, in <block>". */
  ariaLabel?: string;
}

export interface ScheduleBulletsProps {
  bullets: readonly ScheduleBullet[];
  /** What did not fit; drawn as "+n more" in the next cell. 0 draws nothing. */
  moreCount?: number;
  /** The dot's fill, e.g. a category's dot colour. */
  dotClassName?: string;
  /**
   * `cells`, the fixed 145 px grid; `lines`, one item a line across the
   * width (Work's tiers, where a title and its Linear id run long).
   */
  layout?: "cells" | "lines";
  className?: string;
}

const CELL =
  "flex h-5 min-w-0 items-center gap-(--space-1) text-(length:--fs-label) leading-(--lh-label) font-normal";

function Mark({
  tone,
  dotClassName,
}: {
  tone: ScheduleBullet["tone"];
  dotClassName?: string;
}) {
  return tone === "dot" ? (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 shrink-0 rounded-full bg-muted-foreground",
        dotClassName,
      )}
    />
  ) : (
    <span
      aria-hidden="true"
      className="h-0.5 w-1.5 shrink-0 bg-muted-foreground"
    />
  );
}

export function ScheduleBullets({
  bullets,
  moreCount = 0,
  dotClassName,
  layout = "cells",
  className,
}: ScheduleBulletsProps) {
  if (bullets.length === 0 && moreCount === 0) return null;
  return (
    <div
      data-schedule-bullets
      style={{
        gridTemplateColumns:
          layout === "cells"
            ? `repeat(auto-fill, ${BULLET_CELL_PX}px)`
            : "minmax(0, 1fr)",
        columnGap: `${BULLET_GAP_X_PX}px`,
        rowGap: `${BULLET_GAP_Y_PX}px`,
      }}
      className={cn("grid", className)}
    >
      {bullets.map((bullet) => {
        const face = (
          <>
            <Mark tone={bullet.tone} dotClassName={dotClassName} />
            <span
              className={cn(
                "truncate",
                bullet.tone === "transition"
                  ? "text-muted-foreground italic"
                  : "text-foreground",
              )}
            >
              {bullet.label}
            </span>
          </>
        );
        return bullet.onOpen ? (
          <button
            key={bullet.id}
            type="button"
            data-bullet-id={bullet.id}
            onClick={(event) => {
              // The block's own button sits beneath; this tap is the bullet's.
              event.stopPropagation();
              bullet.onOpen?.();
            }}
            aria-label={bullet.ariaLabel}
            className={cn(
              CELL,
              "rounded-(--radius-control) text-left",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            {face}
          </button>
        ) : (
          <span key={bullet.id} data-bullet-id={bullet.id} className={CELL}>
            {face}
          </span>
        );
      })}
      {moreCount > 0 ? (
        <span className={cn(CELL, "font-medium text-muted-foreground")}>
          +{moreCount} more
        </span>
      ) : null}
    </div>
  );
}
