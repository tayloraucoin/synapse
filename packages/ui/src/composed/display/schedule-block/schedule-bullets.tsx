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
 *
 * SCHEDULE'S MARKS (USE-27): a bullet's `mark` is what its item says now,
 * never colour alone. `check`, a 10 px check in the block's colour
 * (`checkClassName`) with the words muted; `running`, a now dot in a ring
 * that pulses (100 % to 40 %, 2 s; still under reduced motion) with
 * "· running" after the words; `firing`, a clay dot in a muted halo, the
 * words receded, never the now colour (D-USE-49). `markLabel` is read, not
 * seen ("done"); `suffix` is seen.
 *
 * ITEM ICONS (USE-42): a bullet's `icon`, drawn by the caller, takes the
 * dot's or the dash's place at its own width; a transition keeps its italic.
 * A mark other than the planned dot wins over the icon.
 */
"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
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
  /** What the item says now (Schedule); unset, the tone's dot or dash. */
  mark?: "dot" | "check" | "running" | "firing";
  /** Seen after the words: "· running". */
  suffix?: string;
  /** Read after the words, not seen: "done". */
  markLabel?: string;
  /** The item's own icon in place of the dot or dash (aria-hidden by the caller). */
  icon?: React.ReactNode;
}

export interface ScheduleBulletsProps {
  bullets: readonly ScheduleBullet[];
  /** What did not fit; drawn as "+n more" in the next cell. 0 draws nothing. */
  moreCount?: number;
  /** The dot's fill, e.g. a category's dot colour. */
  dotClassName?: string;
  /** The check's colour, the block's own (a text colour class). */
  checkClassName?: string;
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
  mark,
  dotClassName,
  checkClassName,
}: {
  tone: ScheduleBullet["tone"];
  mark: ScheduleBullet["mark"];
  dotClassName?: string;
  checkClassName?: string;
}) {
  if (tone === "transition") {
    return (
      <span
        aria-hidden="true"
        className="h-0.5 w-1.5 shrink-0 bg-muted-foreground"
      />
    );
  }
  switch (mark) {
    case "check":
      return (
        <CheckIcon
          aria-hidden="true"
          strokeWidth={2.5}
          className={cn(
            "size-2.5 shrink-0 text-muted-foreground",
            checkClassName,
          )}
        />
      );
    case "running":
      return (
        <span
          aria-hidden="true"
          data-mark="running"
          className="relative flex size-3 shrink-0 items-center justify-center"
        >
          <span className="absolute inset-0 rounded-full border border-now/45 motion-safe:animate-held" />
          <span className="size-1.5 rounded-full bg-now" />
        </span>
      );
    case "firing":
      return (
        <span
          aria-hidden="true"
          data-mark="firing"
          className="flex size-3 shrink-0 items-center justify-center rounded-full bg-fill-muted"
        >
          <span className="size-1.5 rounded-full bg-category-clay-dot" />
        </span>
      );
    default:
      return (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full bg-muted-foreground",
            dotClassName,
          )}
        />
      );
  }
}

export function ScheduleBullets({
  bullets,
  moreCount = 0,
  dotClassName,
  checkClassName,
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
        const receded = bullet.mark === "check" || bullet.mark === "firing";
        const face = (
          <>
            {bullet.icon !== undefined &&
            (bullet.mark === undefined || bullet.mark === "dot") ? (
              <span
                aria-hidden="true"
                data-bullet-icon
                className="flex h-4 shrink-0 items-center justify-center"
              >
                {bullet.icon}
              </span>
            ) : (
              <Mark
                tone={bullet.tone}
                mark={bullet.mark}
                dotClassName={dotClassName}
                checkClassName={checkClassName}
              />
            )}
            <span
              className={cn(
                "truncate",
                bullet.tone === "transition"
                  ? "text-muted-foreground italic"
                  : receded
                    ? "text-muted-foreground"
                    : "text-foreground",
              )}
            >
              {bullet.label}
              {bullet.suffix ? ` ${bullet.suffix}` : null}
              {bullet.markLabel ? (
                <span className="sr-only">, {bullet.markLabel}</span>
              ) : null}
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
