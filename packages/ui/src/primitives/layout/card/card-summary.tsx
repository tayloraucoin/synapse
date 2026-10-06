/**
 * CardSummary — the collapsed setup card, two lines (UX v1.3 R57, R58,
 * §10.2; DAY-1).
 *
 * "*Done* collapses a setup card to two lines — glyph · name · *Edit* on the
 * first, the facts as a caption on the second, wrapping to two lines at
 * most — and the card stays where it was." The v1.2 one-liner truncated its
 * facts at 375px (T3.3); here the title alone truncates and the caption
 * wraps, clamped at two.
 *
 * A COMPOSITION OF THE CARD'S PARTS, NOT A CARD VARIANT. It renders inside a
 * `Card` the feature folder owns — the fold, the open state and the focus
 * move to *Edit* stay theirs. `leading` is any node, so a `PriorityMark` can
 * sit beside the `EmojiSlot` (R59) without this primitive importing either.
 *
 * The group is named by the title alone (`aria-labelledby`); the caption is
 * read in flow after it, so the card reads *Stretch, matters 5, usually 12
 * min* (v1.3 §10.4) with the mark's own name in between.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { CardAction, CardDescription, CardHeader, CardTitle } from "./card";

export interface CardSummaryClasses {
  root?: string;
  title?: string;
  caption?: string;
}

export interface CardSummaryProps {
  /** The `EmojiSlot`, and a `PriorityMark` beside it where the card has one. */
  leading?: React.ReactNode;
  title: React.ReactNode;
  /** The facts, muted, under the title; wraps to two lines and clamps. */
  caption?: React.ReactNode;
  /** The trailing slot on the first line — the card's *Edit*. */
  action?: React.ReactNode;
  classes?: CardSummaryClasses;
  className?: string;
}

export function CardSummary({ leading, title, caption, action, classes, className }: CardSummaryProps) {
  const titleId = React.useId();
  const hasCaption = caption !== undefined && caption !== null && caption !== "";

  return (
    <CardHeader
      role="group"
      aria-labelledby={titleId}
      data-slot="card-summary"
      className={cn("items-start", classes?.root, className)}
    >
      {leading === undefined || leading === null ? null : (
        <div className="flex shrink-0 items-center gap-(--space-1)">{leading}</div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-(--target) items-center gap-(--space-2)">
          <CardTitle id={titleId} className={cn("truncate", classes?.title)}>
            {title}
          </CardTitle>
          {action === undefined || action === null ? null : <CardAction>{action}</CardAction>}
        </div>
        {hasCaption ? (
          <CardDescription
            className={cn(
              "line-clamp-2 text-(length:--fs-caption) leading-(--lh-caption)",
              classes?.caption,
            )}
          >
            {caption}
          </CardDescription>
        ) : null}
      </div>
    </CardHeader>
  );
}
