/**
 * ListRow — the generic setup-list row (v2 handoff §5.5).
 *
 * Adapted from CC's `settings-root-list` / `recent-session-row`: a `ul.divide-y`
 * of full-width `Link`/`button` rows, with the trailing control OUTSIDE the
 * link. That structure is the whole point. A row that nests a menu button
 * inside its own link produces a link containing a button — invalid, and in
 * practice a control that either swallows the row's click or cannot be reached
 * by keyboard at all. Here the surface and the trailing control are siblings,
 * so they are two focusables in the order a person expects.
 *
 * NOT built on shadcn `item` (§2.6): CC builds rows this way and Synapse
 * follows, which keeps one row anatomy across both codebases.
 *
 * LAYOUT: `compact` stacks the meta under the title; `wide` moves it to a
 * right-hand tabular column. The prop is explicit rather than a media query so
 * a wide sheet on a narrow viewport can still ask for the stacked form.
 *
 * The row renders an `li` by default because its home is a `ul`. Pass
 * `as="div"` for the handful of places a row stands alone.
 */
"use client";

import type { CategoryKey, IconValue, Layout } from "@syn/types";
import Link from "next/link";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { CategoryChip } from "../category-chip";
import { EmojiSlot, isIconValue } from "../emoji-slot";
import { Tag } from "../tag";
import { listRowSurfaceVariants } from "./list-row.variants";

export interface ListRowClasses {
  root?: string;
  leading?: string;
  title?: string;
  meta?: string;
  trailing?: string;
}

export interface ListRowProps {
  /** An `ItemIcon` or a swatch — or, under v1.2, an `IconValue` rendered through `EmojiSlot` (RUN-7). */
  leading?: React.ReactNode | IconValue;
  title: React.ReactNode;
  /** "10–20 min · importance 6" */
  meta?: React.ReactNode;
  chip?: { key: CategoryKey; name: string };
  /** "wake-up" | "archived" | "default" */
  tag?: string;
  /** A chevron, an `EllipsesMenu`, or a ghost text action. */
  trailing?: React.ReactNode;
  layout?: Layout;
  /** Archived rows read at 0.55. */
  muted?: boolean;
  href?: string;
  onClick?: () => void;
  /** Overrides the computed accessible name. */
  ariaLabel?: string;
  as?: "li" | "div";
  classes?: ListRowClasses;
  className?: string;
}

export function ListRow({
  leading,
  title,
  meta,
  chip,
  tag,
  trailing,
  layout = "compact",
  muted = false,
  href,
  onClick,
  ariaLabel,
  as: Wrapper = "li",
  classes,
  className,
}: ListRowProps) {
  const interactive = href !== undefined || onClick !== undefined;

  const identity = (
    <span
      className={cn(
        "flex min-w-0 flex-1",
        layout === "wide"
          ? "items-center gap-(--space-3)"
          : "flex-col gap-(--space-1)",
      )}
    >
      <span className="flex min-w-0 items-center gap-(--space-2)">
        <Text
          as="span"
          variant="row-title"
          weight={500}
          truncate
          className={classes?.title}
        >
          {title}
        </Text>
        {chip === undefined ? null : (
          <CategoryChip categoryKey={chip.key} name={chip.name} />
        )}
        {tag === undefined ? null : <Tag>{tag}</Tag>}
      </span>

      {meta === undefined ? null : (
        <Text
          as="span"
          variant="secondary"
          tone="secondary"
          className={cn(
            layout === "wide" && "ms-auto shrink-0 tabular-nums",
            classes?.meta,
          )}
        >
          {meta}
        </Text>
      )}
    </span>
  );

  const surface = cn(
    listRowSurfaceVariants({ interactive, muted }),
    classes?.root,
  );

  const body = (
    <>
      {leading === undefined ? null : (
        <span className={cn("flex shrink-0 items-center", classes?.leading)}>
          {isIconValue(leading) ? <EmojiSlot icon={leading} /> : leading}
        </span>
      )}
      {identity}
    </>
  );

  return (
    <Wrapper className={cn("flex items-center", className)}>
      {href !== undefined ? (
        <Link href={href} aria-label={ariaLabel} className={surface}>
          {body}
        </Link>
      ) : onClick !== undefined ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          className={surface}
        >
          {body}
        </button>
      ) : (
        <div aria-label={ariaLabel} className={surface}>
          {body}
        </div>
      )}

      {trailing === undefined ? null : (
        <span
          className={cn(
            "flex shrink-0 items-center pe-(--space-2)",
            muted && "opacity-55",
            classes?.trailing,
          )}
        >
          {trailing}
        </span>
      )}
    </Wrapper>
  );
}
