"use client";

import Link from "next/link";
import { Button, cn, Text } from "@syn/ui";
import { BLOCK_HUE } from "@/components/planner";
import { HUE_DOT } from "@/components/planner/block-hue";
import type { NowDayBlockView } from "@/lib/data/use-now";
import { todayBlockRoute, todayReviewRoute } from "@/lib/routes";
import { NOW_COPY as COPY } from "./copy";

/**
 * Before Ready, go (USE-17; now/states/before-ready-go.md, D-USE-5,
 * D-USE-25): the tab reads List and shows the day as the List does, one row
 * a block between hairlines (the kind's 3 px bar, the name, the span), a
 * meal muted with no bar, and "Review the day" floating on the footer fade.
 * The canvas's "[placeholder: …]" caption is not shipped.
 *
 * A row opens its block [ASSUMPTION: as the List does today].
 */
export function BeforeGoList({
  blocks,
}: {
  blocks: readonly NowDayBlockView[];
}) {
  return (
    <div className="flex flex-1 flex-col">
      <ul
        aria-label={COPY.dayListName}
        className="divide-border flex flex-col divide-y px-(--space-4) pt-(--space-2)"
      >
        {blocks.map((block) => (
          <li key={block.id} data-before-go-row={block.id}>
            <Link
              href={todayBlockRoute(block.id)}
              className={cn(
                "flex min-h-(--target) items-center gap-(--space-3) py-(--space-3)",
                "focus-visible:ring-ring rounded-(--radius-control) focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "h-7 w-0.75 shrink-0",
                  block.meal
                    ? "bg-transparent"
                    : HUE_DOT[BLOCK_HUE[block.kind]],
                )}
              />
              <Text
                as="span"
                variant="body"
                weight={block.meal ? 400 : 600}
                tone={block.meal ? "muted" : "ink"}
                className="min-w-0 flex-1"
                truncate
              >
                {block.name}
              </Text>
              <Text
                as="span"
                variant="secondary"
                tone="secondary"
                className="shrink-0 tabular-nums"
              >
                {COPY.span(block.startsAt, block.endsAt)}
              </Text>
            </Link>
          </li>
        ))}
      </ul>

      {/* D-USE-25: the button floats on a fade to the background, above the tabs. */}
      <div className="sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] mt-auto bg-linear-to-b from-transparent to-background px-(--space-4) pt-(--space-8) pb-(--space-3)">
        <Button asChild size="lg" className="w-full font-semibold">
          <Link href={todayReviewRoute()}>{COPY.reviewTheDay}</Link>
        </Button>
      </div>
    </div>
  );
}
