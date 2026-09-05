/**
 * Tag — the muted word tag (v2 handoff §5.5).
 *
 * *wake-up*, *archived*, *default*, *overridden*, *planned*. One word, or two,
 * never a count and never a colour that means something on its own: the word
 * is the meaning (official spec §9.3, colour never alone).
 *
 * `accent` is for *overridden* only — the one place a tag says "this differs
 * from the template". Everything else is `muted`.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";

export type TagTone = "muted" | "accent";

export interface TagProps {
  children: string;
  tone?: TagTone;
  className?: string;
}

export function Tag({ children, tone = "muted", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap",
        "text-[length:var(--fs-caption)] leading-(--lh-caption)",
        tone === "accent" ? "text-accent-text" : "text-text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
