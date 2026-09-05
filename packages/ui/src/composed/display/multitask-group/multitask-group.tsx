/**
 * MultitaskGroup — rows that happen at once (v2 handoff §5.6).
 *
 * A 2px ink line spanning its members with the word *multitask* above it. The
 * word is there because the bracket alone would read as an indent, and an
 * indent means "child of" in every other list a person has used.
 *
 * Renders a `ul` so `ItemRow`'s `li` stays valid inside it; the parent list
 * nests this group as one of its own items.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export interface MultitaskGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export function MultitaskGroup({
  children,
  label = "multitask",
  className,
}: MultitaskGroupProps) {
  return (
    <li className={cn("list-none", className)}>
      <Text
        as="span"
        variant="caption"
        tone="secondary"
        className="block ps-(--space-4) pt-(--space-2)"
      >
        {label}
      </Text>
      <ul
        role="group"
        aria-label={label}
        className="border-s-ink ms-(--space-4) border-s-2"
      >
        {children}
      </ul>
    </li>
  );
}
