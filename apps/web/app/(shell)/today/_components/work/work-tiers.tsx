"use client";

import * as React from "react";
import type { WorkTier } from "@syn/types";
import { cn, toastUndo, useIsSplit } from "@syn/ui";
import {
  LiftedMeeting,
  MeetingBand,
  NextCard,
  RunningWorkCard,
  TierGroup,
  WaitingGroup,
  WhileItFiresLine,
  type WorkRowHandlers,
} from "@/components/work";
import { NewTaskSheet } from "@/components/work/add";
import { TIER_EDGE_COPY } from "@/lib/data/tier-edges";
import {
  TODAY_WORK_COPY,
  workCardFigures,
  type TodayWorkView,
} from "@/lib/data/today-work";
import type { useTodayLinear } from "@/lib/data/use-today-linear";
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
 *
 * The edges (USE-61): a tier past its usual number carries its helper; on
 * the phone an empty tier folds to its heading with "+ Add", at the desk
 * every tier offers "+ Add to <tier>" on hover or focus; either opens New
 * task with that tier set, in the block under way when it is Work.
 *
 * Linear's side (USE-63): Waiting under Stretch, its rows never Next; each
 * row's Linear line with Try again or Reopen through `linear`. A write that
 * fails says "Not updated in Linear." politely, once.
 */
export interface WorkTiersProps extends Pick<WorkRowHandlers, "onOpen"> {
  view: TodayWorkView;
  now: Date;
  loop?: ReturnType<typeof useWorkLoop>;
  linear?: ReturnType<typeof useTodayLinear>;
  onCheckReminder?: (todoId: string, checked: boolean) => void;
  headingAs?: "h2" | "h3";
  /**
   * The phone's meetings in the flow (USE-62): bands where the plan reaches
   * them, and one under way lifted ahead of the tiers under "At <time>",
   * Next back in its row. The desk names them on its band instead (D-USE-77).
   */
  meetingsInFlow?: boolean;
  className?: string;
}

export function WorkTiers({
  view,
  now,
  loop,
  linear,
  onCheckReminder,
  headingAs = "h2",
  meetingsInFlow = false,
  className,
  onOpen,
}: WorkTiersProps) {
  const [said, setSaid] = React.useState("");
  const atDesk = useIsSplit();
  // The tier stays set while the sheet closes, so its form does not jump.
  const [adding, setAdding] = React.useState<{
    tier: WorkTier | null;
    open: boolean;
  }>({ tier: null, open: false });
  const setAddTier = (tier: WorkTier) => setAdding({ tier, open: true });
  const addFor = (tier: WorkTier, word: string, folded: boolean) =>
    atDesk
      ? {
          label: TIER_EDGE_COPY.addTo(word),
          name: TIER_EDGE_COPY.addToName(word),
          reveal: "hover" as const,
          onAdd: () => setAddTier(tier),
        }
      : folded
        ? {
            label: TIER_EDGE_COPY.add,
            name: TIER_EDGE_COPY.addToName(word),
            reveal: "always" as const,
            onAdd: () => setAddTier(tier),
          }
        : null;
  const titleOf = (id: string) =>
    view.tiers.flatMap((group) => group.rows).find((row) => row.id === id)
      ?.title ?? "";

  // "Next: <title>" when Next moves to another item, after the action's words.
  const nextId = view.nextRow?.id ?? null;
  const nextTitle = view.nextRow?.title ?? null;
  // "At 11:00: <meeting>" once, when a meeting lifts on the phone (USE-62).
  const liftedSaid = meetingsInFlow
    ? view.meetings.lifted.map((meeting) => meeting.said).join(" ")
    : "";
  const lastLifted = React.useRef(liftedSaid);
  React.useEffect(() => {
    if (lastLifted.current === liftedSaid) return;
    lastLifted.current = liftedSaid;
    if (liftedSaid) setSaid(liftedSaid);
  }, [liftedSaid]);

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
  // A meeting at its time holds the lift on the phone; Next goes back to its row.
  const meetings = meetingsInFlow ? view.meetings : null;
  const next = view.lift && !meetings?.lifted.length ? view.nextRow : null;
  const bandFor = (band: (typeof view.meetings.bands)[number]) => ({
    rowId: band.afterSlotId ?? "",
    content: (
      <MeetingBand
        key={band.id}
        title={band.title}
        tag={band.tag}
        line={band.line}
        lead={band.lead}
        name={band.name}
      />
    ),
  });
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

  // "Not updated in Linear." once per failed write, politely.
  const failedKey = view.tiers
    .flatMap((group) => group.rows)
    .flatMap((row) =>
      row.linear?.kind === "failed" ? [row.linear.writeId] : [],
    )
    .join(" ");
  const saidFailed = React.useRef(new Set<string>());
  React.useEffect(() => {
    const fresh = failedKey
      .split(" ")
      .filter((id) => id && !saidFailed.current.has(id));
    if (fresh.length === 0) return;
    for (const id of fresh) saidFailed.current.add(id);
    setSaid(TODAY_WORK_COPY.notUpdated);
  }, [failedKey]);
  const onRetryLinear = linear
    ? (id: string) => void linear.retry(id)
    : undefined;
  const onReopen = linear ? (id: string) => void linear.reopen(id) : undefined;

  return (
    <div className={cn("flex flex-col gap-(--space-6)", className)}>
      {meetings?.lifted.map((meeting) => (
        <LiftedMeeting
          key={meeting.id}
          variant="card"
          heading={meeting.heading}
          headingAs={headingAs}
          title={meeting.title}
          tag={meeting.tag}
          meta={meeting.meta}
        />
      ))}
      {meetings?.bands
        .filter((band) => band.afterSlotId === null)
        .map((band) => bandFor(band).content)}
      {view.tiers.map((group) => (
        <TierGroup
          key={group.tier}
          tier={group.tier}
          word={group.word}
          rows={group.rows}
          headingAs={headingAs}
          helper={group.helper}
          add={addFor(group.tier, group.word, group.rows.length === 0)}
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
          bands={meetings?.bands
            .filter((band) => band.afterSlotId !== null)
            .map(bandFor)}
          onOpen={onOpen}
          onToggleFiring={toggleFiring}
          onRetryLinear={onRetryLinear}
          onReopen={onReopen}
        />
      ))}
      <WaitingGroup
        heading={TODAY_WORK_COPY.waiting}
        rows={view.waiting}
        headingAs={headingAs}
        onOpen={onOpen}
      />
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
      <NewTaskSheet
        open={adding.open}
        onOpenChange={(open) => setAdding((was) => ({ ...was, open }))}
        dateKey={view.dateKey}
        blockId={view.band?.isWork ? view.band.id : undefined}
        tier={adding.tier ?? undefined}
        from="add"
      />
    </div>
  );
}

function joinSaid(words: string, more: string): string {
  return words ? `${words} ${more}` : more;
}
