"use client";

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
 * Named apart from `@syn/ui`'s legacy `BlockHeader`.
 */
export interface DayBlockHeaderProps {
  kind: StoredBlockKind;
  name: string;
  detail: string;
  /** The ··· menu: its items and the trigger's name ("Work block, more"). */
  menu?: { label: string; items: readonly EllipsesMenuItem[] } | null;
  /** "Step away", shown only while a work timer runs (D-USE-52). */
  stepAway?: { label: string; onPress: () => void } | null;
  as?: "h2" | "h3";
  className?: string;
}

export function DayBlockHeader({
  kind,
  name,
  detail,
  menu = null,
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
      <span
        aria-hidden="true"
        className={cn("mt-1 h-7 w-1 shrink-0", HUE_DOT[hue])}
      />
      <div className="min-w-0 flex-1">
        <Text as={as} variant="heading">
          {name}
        </Text>
        <Text as="p" variant="secondary" tone="muted" className="tabular-nums">
          {detail}
        </Text>
      </div>
      {stepAway ? (
        <Button variant="secondary" size="sm" onClick={stepAway.onPress}>
          <StepAwayIcon aria-hidden="true" className="size-4" />
          {stepAway.label}
        </Button>
      ) : null}
      {menu ? <EllipsesMenu label={menu.label} items={menu.items} /> : null}
    </div>
  );
}
