"use client";

import type { WorkTier } from "@syn/types";
import { AddIcon, Button, CloseIcon, cn, HueSquare, Text } from "@syn/ui";
import { shortDate } from "@/components/work/add/new-task/form";
import { TIER_HUE } from "@/components/work/view";
import type { WorkSheetSession } from "@/lib/data/item-sheet-work";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.sessions;
const TIER = ITEM_SHEET_COPY.work.tier;

/**
 * SessionsField — a spread task's Sessions in its sheet (USE-67;
 * tier-and-sessions.md, D-USE-54): "Sessions" with "2 to 4 h each" on the
 * right, a row a day ("Mon 12" bold for the one open here, with "· this
 * one"), each its tier's square and word, × on every other open day, then
 * "+ Add a day". × drops that day only; the task and Linear stay. A done
 * session reads as its day, with no ×. Props only.
 */
export interface SessionsFieldProps {
  sessions: readonly WorkSheetSession[];
  /** "2 to 4 h"; empty with no length. */
  range: string;
  onDrop: (slotId: string) => void;
  onAddDay: () => void;
}

export function SessionsField({
  sessions,
  range,
  onDrop,
  onAddDay,
}: SessionsFieldProps) {
  return (
    <div className="border-hairline flex flex-col border-t pt-(--space-3)">
      <div className="flex items-baseline justify-between gap-(--space-3)">
        <Text as="h3" variant="body" className="text-foreground">
          {COPY.label}
        </Text>
        {range === "" ? null : (
          <Text as="span" variant="caption" tone="secondary">
            {COPY.each(range)}
          </Text>
        )}
      </div>
      <ul className="divide-hairline flex flex-col divide-y">
        {sessions.map((session) => (
          <SessionLine
            key={session.slotId}
            session={session}
            onDrop={() => onDrop(session.slotId)}
          />
        ))}
        <li>
          <Button
            variant="ghost"
            onClick={onAddDay}
            className="text-muted-foreground -ms-(--space-3) min-h-(--target) gap-(--space-2) font-normal"
          >
            <AddIcon aria-hidden="true" className="size-4" />
            {COPY.addDay}
          </Button>
        </li>
      </ul>
    </div>
  );
}

function tierWord(tier: WorkTier | null): string {
  return tier === null ? COPY.noTier : TIER[tier];
}

/** One day's share: the day, its tier's square and word, × unless it's this one. */
function SessionLine({
  session,
  onDrop,
}: {
  session: WorkSheetSession;
  onDrop: () => void;
}) {
  const day = shortDate(session.dateKey);
  const word = tierWord(session.tier);
  return (
    <li className="flex min-h-(--target) items-center gap-(--space-3)">
      <Text
        as="span"
        variant="body"
        className={cn("w-20 shrink-0", session.thisOne && "font-semibold")}
      >
        {day}
      </Text>
      <span className="flex min-w-0 flex-1 items-center gap-(--space-2)">
        {session.tier === null ? null : (
          <HueSquare hue={TIER_HUE[session.tier]} />
        )}
        <Text
          as="span"
          variant="body"
          tone={session.done ? "secondary" : undefined}
        >
          {session.thisOne ? `${word} · ${COPY.thisOne}` : word}
        </Text>
      </span>
      {session.thisOne || session.done ? null : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.drop(day)}
          onClick={onDrop}
          className="text-muted-foreground -me-(--space-3)"
        >
          <CloseIcon aria-hidden="true" className="size-4" />
        </Button>
      )}
    </li>
  );
}
