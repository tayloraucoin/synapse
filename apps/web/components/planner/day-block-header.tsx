"use client";

import type * as React from "react";
import type { StoredBlockKind } from "@syn/types";
import {
  Button,
  cn,
  EllipsesMenu,
  StepAwayIcon,
  Text,
  type EllipsesMenuItem,
} from "@syn/ui";
import { BLOCK_HUE, HUE_DOT } from "./block-hue";

/**
 * DayBlockHeader — the block's header on the phone (USE-10; Today's index,
 * the phone): the kind's colour bar, the name, its span and what is in it
 * ("9:30 to 12:00 · Kestrel weekly at 11:00"), and on the right the ···
 * menu. While a work timer runs the screen passes `stepAway`, and its quiet
 * button sits beside ··· (D-USE-52).
 *
 * Now's forms (USE-17): a meal shows its glyph, muted, in the bar's place;
 * `note` is behind's one quiet line under the span ("Planned to end at
 * 8:00"), muted, never a colour; `trailing` takes Now's own ··· pull-down in
 * place of the row menu.
 *
 * Named apart from `@syn/ui`'s legacy `BlockHeader`.
 */
export interface DayBlockHeaderProps {
  kind: StoredBlockKind;
  name: string;
  detail: string;
  /** The ··· menu: its items and the trigger's name ("Work block, more"). */
  menu?: { label: string; items: readonly EllipsesMenuItem[] } | null;
  /** In the colour bar's place: a meal's glyph (USE-17). */
  glyph?: React.ReactNode;
  /** One muted line under the span: behind's "Planned to end at 8:00". */
  note?: string | null;
  /** In place of `menu`: Now's ··· pull-down (USE-17). */
  trailing?: React.ReactNode;
  /** "Step away", shown only while a work timer runs (D-USE-52). */
  stepAway?: { label: string; name?: string; onPress: () => void } | null;
  as?: "h2" | "h3";
  className?: string;
}

export function DayBlockHeader({
  kind,
  name,
  detail,
  menu = null,
  glyph = null,
  note = null,
  trailing = null,
  stepAway = null,
  as = "h2",
  className,
}: DayBlockHeaderProps) {
  const hue = BLOCK_HUE[kind];
  return (
    <div
      data-day-block-header={kind}
      className={cn(
        "flex items-start gap-(--space-3) pt-(--space-4) pb-(--space-2)",
        className,
      )}
    >
      {glyph ? (
        <span
          aria-hidden="true"
          className="text-text-muted mt-1.5 flex w-4 shrink-0 justify-center"
        >
          {glyph}
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={cn("mt-1 h-7 w-1 shrink-0", HUE_DOT[hue])}
        />
      )}
      <div className="min-w-0 flex-1">
        <Text as={as} variant="heading">
          {name}
        </Text>
        <Text as="p" variant="secondary" tone="muted" className="tabular-nums">
          {detail}
        </Text>
        {note ? (
          <Text as="p" variant="caption" tone="muted" className="tabular-nums">
            {note}
          </Text>
        ) : null}
      </div>
      {stepAway ? (
        <Button
          variant="secondary"
          size="sm"
          aria-label={stepAway.name}
          data-step-away-button
          onClick={stepAway.onPress}
          className="rounded-full"
        >
          <StepAwayIcon aria-hidden="true" className="size-4" />
          {stepAway.label}
        </Button>
      ) : null}
      {trailing ??
        (menu ? <EllipsesMenu label={menu.label} items={menu.items} /> : null)}
    </div>
  );
}
