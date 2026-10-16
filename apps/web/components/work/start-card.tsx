"use client";

import * as React from "react";
import type { WorkTier } from "@syn/types";
import { Button, Checkbox, HueSquare, Text } from "@syn/ui";
import { TIER_HUE } from "./view";

/**
 * StartCard — Today with nothing planned (USE-82; nothing-planned.md,
 * D-USE-42, D-USE-56): a calm card on surface offering what the last workday
 * left open, each item at the tier it had. No count and no word for missed.
 *
 * At the desk: the title, its line, "Left open on Friday" and a row per item
 * with "was Primary" and its own Add to Primary; then Add both as they were
 * (primary) and Plan the week. On the phone: each item checked with its tier
 * square and word, Open the pool and Bring these in (primary); the checks
 * are the card's own until Bring these in hands them over. Props only.
 */
export interface StartCardItem {
  slotId: string;
  tier: WorkTier;
  /** "Primary". */
  tierWord: string;
  title: string;
  emoji: string | null;
}

interface StartCardBase {
  title: string;
  items: StartCardItem[];
}

export interface StartCardDeskProps extends StartCardBase {
  variant: "desk";
  lead: string;
  /** "Left open on Friday". */
  heading: string;
  words: {
    /** "was Primary". */
    was: (tierWord: string) => string;
    /** "Add to Primary". */
    addTo: (tierWord: string) => string;
    /** "Add [Audit log export] to Primary". */
    addName: (title: string, tierWord: string) => string;
    /** "Add both as they were". */
    addAll: string;
    planTheWeek: string;
  };
  onAdd: (slotId: string) => void;
  onAddAll: () => void;
  onPlanTheWeek: () => void;
}

export interface StartCardPhoneProps extends StartCardBase {
  variant: "phone";
  /** "Left open on Friday, at the tier it had:". */
  lead: string;
  words: { openThePool: string; bringIn: string };
  onOpenPool: () => void;
  onBringIn: (slotIds: ReadonlySet<string>) => void;
}

export type StartCardProps = StartCardDeskProps | StartCardPhoneProps;

export function StartCard(props: StartCardProps) {
  return (
    <section
      aria-label={props.title}
      data-start-card={props.variant}
      className="bg-surface flex flex-col rounded-(--radius-sheet) border border-hairline"
    >
      {props.variant === "desk" ? (
        <DeskBody {...props} />
      ) : (
        <PhoneBody {...props} />
      )}
    </section>
  );
}

function DeskBody({
  title,
  lead,
  heading,
  items,
  words,
  onAdd,
  onAddAll,
  onPlanTheWeek,
}: StartCardDeskProps) {
  const headingId = React.useId();
  return (
    <div className="flex flex-col gap-(--space-4) p-(--space-6)">
      <div className="flex flex-col gap-(--space-3)">
        <h2 className="font-serif text-(length:--fs-title) leading-(--lh-title) text-ink">
          {title}
        </h2>
        <Text as="p" variant="body" tone="secondary">
          {lead}
        </Text>
      </div>
      <div className="flex flex-col gap-(--space-2)">
        <Text id={headingId} as="h3" variant="secondary" weight={600}>
          {heading}
        </Text>
        <ul
          aria-labelledby={headingId}
          className="flex flex-col gap-(--space-2)"
        >
          {items.map((item) => (
            <li
              key={item.slotId}
              className="flex min-h-10 items-center gap-(--space-3) rounded-(--radius-control) border border-hairline bg-background ps-(--space-3)"
            >
              <span aria-hidden="true" className="w-5 shrink-0 text-center">
                {item.emoji}
              </span>
              <Text
                as="span"
                variant="secondary"
                className="min-w-0 flex-1 truncate"
              >
                {item.title}
              </Text>
              <Text
                as="span"
                variant="caption"
                tone="muted"
                className="shrink-0"
              >
                {words.was(item.tierWord)}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 font-semibold"
                aria-label={words.addName(item.title, item.tierWord)}
                onClick={() => onAdd(item.slotId)}
              >
                {words.addTo(item.tierWord)}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-(--space-2) pt-(--space-1)">
        <Button size="md" onClick={onAddAll}>
          {words.addAll}
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="bg-background"
          onClick={onPlanTheWeek}
        >
          {words.planTheWeek}
        </Button>
      </div>
    </div>
  );
}

function PhoneBody({
  title,
  lead,
  items,
  words,
  onOpenPool,
  onBringIn,
}: StartCardPhoneProps) {
  const [checked, setChecked] = React.useState<ReadonlySet<string>>(
    () => new Set(items.map((item) => item.slotId)),
  );
  const toggle = (slotId: string, on: boolean) =>
    setChecked((was) => {
      const next = new Set(was);
      if (on) next.add(slotId);
      else next.delete(slotId);
      return next;
    });
  const leadId = React.useId();
  return (
    <div className="flex flex-col gap-(--space-3) p-(--space-3)">
      <div className="flex flex-col">
        <Text as="h3" variant="body" weight={600}>
          {title}
        </Text>
        <Text id={leadId} as="p" variant="secondary" tone="muted">
          {lead}
        </Text>
      </div>
      <ul aria-labelledby={leadId} className="flex flex-col">
        {items.map((item) => {
          const id = `start-${item.slotId}`;
          return (
            <li
              key={item.slotId}
              className="flex min-h-12 items-center gap-(--space-3) border-t border-hairline py-(--space-2)"
            >
              <Checkbox
                id={id}
                checked={checked.has(item.slotId)}
                onCheckedChange={(on) => toggle(item.slotId, on === true)}
              />
              <label
                htmlFor={id}
                className="flex min-w-0 flex-1 items-center gap-(--space-2)"
              >
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  {item.emoji}
                </span>
                <Text as="span" variant="secondary" className="min-w-0 flex-1">
                  {item.title}
                </Text>
                <span className="flex shrink-0 items-center gap-(--space-1)">
                  <HueSquare hue={TIER_HUE[item.tier]} />
                  <Text as="span" variant="caption" tone="muted">
                    {item.tierWord}
                  </Text>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="grid grid-cols-2 gap-(--space-2)">
        <Button
          variant="secondary"
          size="md"
          className="bg-background"
          onClick={onOpenPool}
        >
          {words.openThePool}
        </Button>
        <Button
          size="md"
          disabled={checked.size === 0}
          onClick={() => onBringIn(checked)}
        >
          {words.bringIn}
        </Button>
      </div>
    </div>
  );
}
