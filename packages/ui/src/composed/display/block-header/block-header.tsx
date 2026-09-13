/**
 * BlockHeader — a block's section heading on the Today tab (UX v1.1 §6.1,
 * §10.2). Replaces `DayPartHeader` for v1.1's screens; the two coexist until
 * DYN-21 removes day parts.
 *
 * "The block's name and its computed span in muted tabular text — *Morning ·
 * 7:03–8:11*." A quiet divider, not a control: the blocks are how a day
 * reads, not how it is organised.
 *
 * THREE STATES (§10.2): with-span · no-span (an unstructured day's block, or
 * one that has no times yet) · split (the caller renders one header per half
 * of a work container; the name carries no "part 1", the span says which).
 * The heading level is the caller's — `h2` on the tab, `h3` inside a review
 * region.
 */
import type { BlockKind } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { BLOCK_KIND_WORDS } from "./copy";

export interface BlockHeaderProps {
  kind: BlockKind;
  /** The template's name; the kind's own word when null. */
  name: string | null;
  span: { startLabel: string; endLabel: string } | null;
  /** One half of a work container split around training (§6.1). */
  split?: boolean;
  as?: "h2" | "h3";
  className?: string;
}

export function BlockHeader({
  kind,
  name,
  span,
  split = false,
  as = "h2",
  className,
}: BlockHeaderProps) {
  const label = name ?? BLOCK_KIND_WORDS[kind];

  return (
    <div
      data-block-header
      data-block-kind={kind}
      data-split={split ? "true" : undefined}
      className={cn(
        "flex items-baseline gap-(--space-2) px-(--space-4) pt-(--space-6) pb-(--space-2)",
        className,
      )}
    >
      <Text as={as} variant="secondary" tone="secondary" weight={500}>
        {label}
      </Text>
      {span === null ? null : (
        <>
          <Text as="span" variant="secondary" tone="secondary" aria-hidden="true">
            ·
          </Text>
          <Text
            as="span"
            variant="secondary"
            tone="secondary"
            className="tabular-nums"
          >
            {`${span.startLabel}–${span.endLabel}`}
          </Text>
        </>
      )}
    </div>
  );
}
