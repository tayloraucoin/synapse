"use client";

import * as React from "react";

import { Text } from "@syn/ui";
import { cn } from "@syn/ui/cn";

import { QUICK_PICK_COPY as COPY } from "./copy";

/**
 * One section, collapsed to one row — UX v1.1 §5.3: "Every section is
 * collapsed to one summary row — *Routine · 6 things · 68 min* … — with
 * **Change** as ghost text on the right; a section opens only when tapped."
 *
 * The row is a button with `aria-expanded`; the section it opens is labelled
 * by it. The common morning is a glance down these rows and one tap.
 */
export function SummaryRow({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const panelId = `${id}-panel`;
  return (
    <section className="border-hairline flex flex-col border-b">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-(--space-3) py-(--space-3) text-left",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none",
        )}
      >
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-(--space-2)">
          <Text as="span" weight={500}>
            {title}
          </Text>
          <Text as="span" tone="secondary">
            {`· ${summary}`}
          </Text>
        </span>
        <Text as="span" variant="secondary" tone="secondary" className="shrink-0">
          {COPY.change}
        </Text>
      </button>
      {open ? (
        <div id={panelId} className="flex flex-col gap-(--space-3) pb-(--space-4)">
          {children}
        </div>
      ) : null}
    </section>
  );
}
