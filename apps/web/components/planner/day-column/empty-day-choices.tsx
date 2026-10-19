"use client";

import * as React from "react";
import Link from "next/link";
import { ChecklistIcon, cn, PlanBlocksIcon, Text } from "@syn/ui";
import { DAY_COLUMN_COPY } from "./copy";

/**
 * EmptyDayChoices — a day with nothing set (D-USE-28, D-USE-30, D-USE-68):
 * the ask under the title, never centred. "Nothing set for <Weekday>." and
 * its line, then two full-width cards 12 px apart, Make a checklist outlined
 * in ink (the likely one) and Plan with blocks on a hairline, then Copy
 * another day as a link. Review the day makes the checklist in place
 * (USE-40); Schedule links there (USE-27). Props only.
 */
export type EmptyDayAction = { href: string } | { onSelect: () => void };

export interface EmptyDayChoicesProps {
  weekday: string;
  checklist: EmptyDayAction;
  blocksHref: string;
  copyHref: string;
  /** Held while the checklist is being written. */
  pending?: boolean;
  className?: string;
}

export function EmptyDayChoices({
  weekday,
  checklist,
  blocksHref,
  copyHref,
  pending = false,
  className,
}: EmptyDayChoicesProps) {
  const words = DAY_COLUMN_COPY.empty;
  return (
    <section
      data-empty-day
      className={cn(
        "flex flex-col gap-(--space-3) px-(--space-4) pt-(--space-4)",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <Text as="p" variant="body" weight={600}>
          {words.title(weekday)}
        </Text>
        <Text as="p" variant="body" tone="muted">
          {words.line}
        </Text>
      </div>
      <Choice
        action={checklist}
        pending={pending}
        icon={<ChecklistIcon aria-hidden="true" className="size-5" />}
        title={words.checklist}
        line={words.checklistLine}
        likely
      />
      <Choice
        action={{ href: blocksHref }}
        icon={<PlanBlocksIcon aria-hidden="true" className="size-5" />}
        title={words.blocks}
        line={words.blocksLine}
      />
      <Link
        href={copyHref}
        className="flex min-h-(--target) items-center self-start text-(length:--fs-label) font-medium text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {words.copy}
      </Link>
    </section>
  );
}

function Choice({
  action,
  icon,
  title,
  line,
  likely = false,
  pending = false,
}: {
  action: EmptyDayAction;
  icon: React.ReactNode;
  title: string;
  line: string;
  /** The likely one, outlined in ink. */
  likely?: boolean;
  pending?: boolean;
}) {
  const className = cn(
    "flex min-h-(--target) w-full items-center gap-(--space-3) rounded-(--radius-control) px-(--space-3) py-(--space-3) text-left",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    likely ? "border-2 border-foreground" : "border border-border",
  );
  const body = (
    <>
      {icon}
      <span className="flex min-w-0 flex-col">
        <Text as="span" variant="secondary" weight={600}>
          {title}
        </Text>
        <Text as="span" variant="caption" tone="muted">
          {line}
        </Text>
      </span>
    </>
  );
  if ("href" in action) {
    return (
      <Link href={action.href} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={action.onSelect}
      disabled={pending}
      aria-busy={pending || undefined}
      className={className}
    >
      {body}
    </button>
  );
}
