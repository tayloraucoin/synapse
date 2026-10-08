/**
 * NextStrip — the header's answer to *which one now?* (Workflow UX v0.1 §3.4,
 * W7, §9).
 *
 * - A task: a `button` reading *Next*, then *{Group} · {Task}*. Pressing it is
 *   `onGo` — the board scrolls the row into view, opens its lane, focuses it.
 * - Everything firing: *Everything is firing.* as text, not a button — there is
 *   nothing to go to.
 * - `null` (no active column, or nothing in it): nothing at all.
 *
 * The caller passes the answer of `resolveNext`; the strip decides nothing.
 *
 * MIDDLE TRUNCATION. A long title keeps its end: the title is split into a
 * head that truncates and a short tail that never shrinks, so *Stockpile
 * measurem… spec* still tells two similar titles apart. The two spans are one
 * string to a screen reader.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { NEXT_STRIP_COPY, type NextStripCopy } from "./copy";

/** How much of a long title's end is kept whole. */
const TAIL = 10;

export type NextStripValue =
  | { kind: "task"; groupName: string | null; title: string }
  | { kind: "all_firing" }
  | null;

export interface NextStripProps {
  next: NextStripValue;
  onGo?: () => void;
  copy?: Partial<NextStripCopy>;
  className?: string;
}

export function NextStrip({ next, onGo, copy: copyOverride, className }: NextStripProps) {
  const copy = { ...NEXT_STRIP_COPY, ...copyOverride };
  if (next === null) return null;

  if (next.kind === "all_firing") {
    return (
      <Text as="p" variant="secondary" tone="secondary" className={cn("min-w-0 truncate", className)}>
        {copy.allFiring}
      </Text>
    );
  }

  const lead = `${next.groupName ?? copy.noGroup} · `;
  const split = next.title.length > TAIL * 2;
  // A space at the split would be dropped at the edge of a flex item
  // ("pricingpage"), so it is kept as a non-breaking one.
  const head = split ? next.title.slice(0, -TAIL).replace(/ $/, " ") : next.title;
  const tail = split ? next.title.slice(-TAIL).replace(/^ /, " ") : "";

  return (
    <button
      type="button"
      onClick={onGo}
      className={cn(
        "inline-flex h-(--target) max-w-full min-w-0 items-center gap-(--space-2) rounded-(--radius) px-(--space-2)",
        "transition-colors duration-(--dur-state) ease-(--ease-settle)",
        "hover:bg-fill-muted",
        className,
      )}
    >
      <Text as="span" variant="secondary" tone="secondary" className="shrink-0">
        {copy.label}
      </Text>{" "}
      <Text as="span" variant="secondary" weight={500} className="flex min-w-0 whitespace-nowrap">
        <span className="min-w-0 truncate">
          {lead}
          {head}
        </span>
        {tail === "" ? null : <span className="shrink-0">{tail}</span>}
      </Text>
    </button>
  );
}
