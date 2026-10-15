"use client";

import type * as React from "react";
import { cn } from "@syn/ui";
import {
  NextCard,
  TierGroup,
  WhileItFiresLine,
  type WorkRowHandlers,
} from "@/components/work";
import type { TodayWorkView } from "@/lib/data/today-work";
import { WORK_COPY as COPY } from "./copy";

/**
 * Today's tiers, at the desk and inside Now's Work block alike (USE-57): each
 * tier in `deriveTodayWork`'s order with its square and word; Next lifted as
 * the card in its own place when nothing is in hand, else a shaded row; a
 * firing item in its tier and place; the reminder line once under the first
 * firing row. The same tree at both widths: the rows trim at `split:`.
 *
 * `card` stands in Next's place when the screen has its own (USE-59's
 * running card); the rest of the slot's writes come through `handlers`.
 */
export interface WorkTiersProps extends WorkRowHandlers {
  view: TodayWorkView;
  onStart?: (slotId: string) => void;
  onDone?: (slotId: string) => void;
  onCheckReminder?: (todoId: string, checked: boolean) => void;
  card?: { rowId: string; content: React.ReactNode } | null;
  headingAs?: "h2" | "h3";
  className?: string;
}

export function WorkTiers({
  view,
  onStart,
  onDone,
  onCheckReminder,
  card = null,
  headingAs = "h2",
  className,
  ...handlers
}: WorkTiersProps) {
  const next = view.lift ? view.nextRow : null;
  const lifted =
    card ??
    (next
      ? {
          rowId: next.id,
          content: (
            <NextCard
              row={next}
              words={{
                start: COPY.start,
                done: COPY.done,
                doneName: COPY.doneName(next.title),
                next: COPY.next,
              }}
              onStart={onStart ? () => onStart(next.id) : undefined}
              onDone={onDone ? () => onDone(next.id) : undefined}
              onToggleFiring={handlers.onToggleFiring}
              onOpen={handlers.onOpen}
            />
          ),
        }
      : null);
  const reminder = view.whileItFires;

  return (
    <div className={cn("flex flex-col gap-(--space-6)", className)}>
      {view.tiers.map((group) => (
        <TierGroup
          key={group.tier}
          tier={group.tier}
          word={group.word}
          rows={group.rows}
          headingAs={headingAs}
          lifted={
            lifted && group.rows.some((row) => row.id === lifted.rowId)
              ? lifted
              : null
          }
          afterRow={
            reminder
              ? {
                  rowId: reminder.rowId,
                  content: (
                    <WhileItFiresLine
                      lead={reminder.lead}
                      title={reminder.title}
                      meta={reminder.meta}
                      checked={false}
                      onCheckedChange={(checked) =>
                        onCheckReminder?.(reminder.todoId, checked)
                      }
                    />
                  ),
                }
              : null
          }
          {...handlers}
        />
      ))}
    </div>
  );
}
