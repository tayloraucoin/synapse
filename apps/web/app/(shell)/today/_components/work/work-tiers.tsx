"use client";

import * as React from "react";
import { cn, toastUndo } from "@syn/ui";
import {
  NextCard,
  RunningWorkCard,
  TierGroup,
  WhileItFiresLine,
  type WorkRowHandlers,
} from "@/components/work";
import { workCardFigures, type TodayWorkView } from "@/lib/data/today-work";
import type { useWorkLoop } from "@/lib/data/use-today-work";
import { WORK_COPY as COPY } from "./copy";

/**
 * Today's tiers, at the desk and inside Now's Work block alike (USE-57): each
 * tier in `deriveTodayWork`'s order with its square and word; Next lifted as
 * the card in its own place when nothing is in hand, else a shaded row; a
 * firing item in its tier and place; the reminder line once under the first
 * firing row. The same tree at both widths: the rows trim at `split:`.
 *
 * The work loop (USE-59): the item in hand is the running card in its row's
 * place, its figures read at `now`, the page's one tick; Start, Pause,
 * Resume, Prompt sent, the ring, the firing mark and Done are `loop`'s
 * writes. "<title> firing", "<title> back" and "Next: <title>" are said
 * politely; nothing sounds and no caption shows on a return (D-USE-62).
 */
export interface WorkTiersProps extends Pick<WorkRowHandlers, "onOpen"> {
  view: TodayWorkView;
  now: Date;
  loop?: ReturnType<typeof useWorkLoop>;
  onCheckReminder?: (todoId: string, checked: boolean) => void;
  headingAs?: "h2" | "h3";
  className?: string;
}

export function WorkTiers({
  view,
  now,
  loop,
  onCheckReminder,
  headingAs = "h2",
  className,
  onOpen,
}: WorkTiersProps) {
  const [said, setSaid] = React.useState("");
  const titleOf = (id: string) =>
    view.tiers.flatMap((group) => group.rows).find((row) => row.id === id)
      ?.title ?? "";

  // "Next: <title>" when Next moves to another item, after the action's words.
  const nextId = view.nextRow?.id ?? null;
  const nextTitle = view.nextRow?.title ?? null;
  const lastNext = React.useRef(nextId);
  React.useEffect(() => {
    if (lastNext.current === nextId) return;
    lastNext.current = nextId;
    if (nextTitle)
      setSaid((words) => joinSaid(words, COPY.saidNext(nextTitle)));
  }, [nextId, nextTitle]);

  const toggleFiring = loop
    ? (id: string, fire: boolean) => {
        setSaid(
          fire ? COPY.saidFiring(titleOf(id)) : COPY.saidBack(titleOf(id)),
        );
        void (fire ? loop.promptSent(id) : loop.bringBack(id));
      }
    : undefined;
  const done = loop
    ? async (id: string) => {
        const title = titleOf(id);
        const undo = await loop.done(id);
        if (undo)
          toastUndo({ text: COPY.doneToast(title), onUndo: () => void undo() });
      }
    : undefined;

  const hand = view.inHand;
  const next = view.lift ? view.nextRow : null;
  const lifted = hand
    ? {
        rowId: hand.slotId,
        content: (
          <RunningWorkCard
            row={hand.row}
            figures={workCardFigures(hand, now, view.dayEnd, view.timeZone)}
            words={{
              pause: COPY.pause,
              resume: COPY.resume,
              promptSent: COPY.promptSent,
              done: COPY.done,
              doneName: COPY.doneName(hand.row.title),
              label: COPY.inHand(hand.row.title),
            }}
            onPause={loop ? () => void loop.pause(hand.slotId) : undefined}
            onResume={loop ? () => void loop.resume(hand.slotId) : undefined}
            onPromptSent={
              toggleFiring ? () => toggleFiring(hand.slotId, true) : undefined
            }
            onDone={done ? () => void done(hand.slotId) : undefined}
            onOpen={onOpen}
          />
        ),
      }
    : next
      ? {
          rowId: next.id,
          content: (
            <NextCard
              row={next}
              words={{
                start: view.nextResumes ? COPY.resume : COPY.start,
                done: COPY.done,
                doneName: COPY.doneName(next.title),
                next: COPY.next,
              }}
              onStart={loop ? () => void loop.start(next.id) : undefined}
              onDone={done ? () => void done(next.id) : undefined}
              onToggleFiring={toggleFiring}
              onOpen={onOpen}
            />
          ),
        }
      : null;
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
          onOpen={onOpen}
          onToggleFiring={toggleFiring}
        />
      ))}
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
    </div>
  );
}

function joinSaid(words: string, more: string): string {
  return words ? `${words} ${more}` : more;
}
