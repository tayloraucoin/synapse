"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { WorkTier } from "@syn/types";
import { cn, toastUndo, useIsSplit } from "@syn/ui";
import {
  LiftedMeeting,
  MeetingBand,
  NextCard,
  RowDrag,
  RunningWorkCard,
  StartWhileOneRuns,
  SwipeHint,
  SwipeToFire,
  TierAddRow,
  TierDrop,
  TierGroup,
  WaitingGroup,
  WhileItFiresLine,
  WorkMenu,
  WorkMenuLift,
  type StartMoveTo,
  type WorkRowHandlers,
  type WorkRowView,
} from "@/components/work";
import { NewTaskSheet } from "@/components/work/add";
import { shortDate } from "@/components/work/add/new-task/form";
import { PLACE_IDS } from "@/lib/data/place";
import { useDataSource } from "@/lib/data/source";
import { TODAY_DRAG } from "@/lib/data/tier-drop";
import { TIER_EDGE_COPY } from "@/lib/data/tier-edges";
import {
  TODAY_WORK_COPY,
  workCardFigures,
  type TodayWorkView,
} from "@/lib/data/today-work";
import type { useTodayLinear } from "@/lib/data/use-today-linear";
import type { useWorkLoop } from "@/lib/data/use-today-work";
import { useWorkMenu } from "@/lib/data/use-work-menu";
import { TIER_WORDS } from "@/lib/data/week-view";
import { useDismissed } from "@/lib/hooks/use-dismissed";
import { SWIPE_REVEAL_PX } from "@/lib/hooks/use-swipe-row";
import { itemSheetRoute } from "@/lib/routes";
import { WORK_COPY as COPY } from "./copy";
import { EMPTY_COPY } from "./empty-copy";

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
 *
 * USE-60: Start that meets an item running opens the ask (Firing or Paused;
 * Cancel writes nothing). A session's Done closes today's share and its
 * toast names the next session; the task and Linear are untouched. The
 * scenarios `today-ask` and `today-done-for-today` stage the ask and the
 * toast on load (held until Undo) for their captures.
 *
 * Nothing slotted (USE-82): `unplanned` draws each empty tier's add row
 * under its heading, always shown; at the desk with nothing planned the
 * tiers take pool rows dropped on them, Primary as the dashed zone "Drop
 * here, or + Add to Primary" (D-USE-42). Each opens New task with the tier.
 * The row gestures (USE-70): on the phone a work row swiped right past its
 * reveal fires (Prompt sent), never from the screen's edge and never on a
 * firing row; the one-time hint sits above the tiers until the swipe is used
 * or ×. A long-press, or at the desk a right-click or the context-menu key,
 * opens the work menu; its actions are the loop's and the work writes', the
 * session ask in the row's Item sheet. Move to another day opens the Item
 * sheet until Move to (USE-69) gives the menu its own sheet. Scenarios
 * `today-thumb-firing` (a row held mid-swipe) and `today-work-menu`.
 *
 * The desk's keys and drag (USE-71): `keyActions` hands the screen's keys
 * the same Prompt sent, Bring back and Done, with their words and toast. At
 * the desk, inside the frame's DragToPlace, each open row (the lifted card
 * too) lifts with the mouse and lands before another row or at a tier's
 * end, shown by a line; the screen writes the drop. The work menu's Move to
 * tier is the keyboard path.
 */
export interface WorkTiersKeyActions {
  fire: (slotId: string) => void;
  bringBack: (slotId: string) => void;
  done: (slotId: string) => void;
}

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
  /** Nothing slotted today (USE-82); `dropZones` while the pool is docked beside. */
  unplanned?: { dropZones: boolean } | null;
  /** The desk's keys call the tiers' own actions (USE-71). */
  keyActions?: React.RefObject<WorkTiersKeyActions | null>;
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
  unplanned = null,
  keyActions,
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
  const emptyRow = (tier: WorkTier, word: string) =>
    unplanned ? (
      <TierAddRow
        variant={atDesk ? "desk" : "phone"}
        label={atDesk ? EMPTY_COPY.plusAddTo(word) : EMPTY_COPY.addTo(word)}
        name={TIER_EDGE_COPY.addToName(word)}
        dropLead={
          atDesk && unplanned.dropZones && tier === "primary"
            ? EMPTY_COPY.dropHere
            : undefined
        }
        dropId={
          atDesk && unplanned.dropZones
            ? PLACE_IDS.cell(view.dateKey, tier)
            : undefined
        }
        onAdd={() => setAddTier(tier)}
      />
    ) : null;
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
  // A session's Done names the next one; a one-day item's names itself.
  const doneText = (id: string) => {
    if (!view.sessionNext.has(id)) return COPY.doneToast(titleOf(id));
    const next = view.sessionNext.get(id);
    return COPY.doneForTodayToast(
      next ? { n: next.n, day: shortDate(next.dateKey) } : null,
    );
  };
  const done = loop
    ? async (id: string) => {
        const text = doneText(id);
        const undo = await loop.done(id);
        if (undo) toastUndo({ text, onUndo: () => void undo() });
      }
    : undefined;

  // The desk's F and D (USE-71): the same writes, words and toast.
  React.useEffect(() => {
    if (!keyActions) return;
    keyActions.current = {
      fire: (id) => toggleFiring?.(id, true),
      bringBack: (id) => toggleFiring?.(id, false),
      done: (id) => void done?.(id),
    };
  });

  // The ask (USE-60): Start meeting an item running asks where it goes.
  const source = useDataSource();
  const staged = source.scenario.view?.open;
  const [asking, setAsking] = React.useState<string | null>(() =>
    staged === "start-ask" ? (view.nextRow?.id ?? null) : null,
  );
  const start = loop
    ? async (id: string) => {
        if ((await loop.start(id)) === "asks") setAsking(id);
      }
    : undefined;
  const running = [...view.states].find(
    ([id, state]) => id !== asking && state === "running",
  );
  const runningTitle = running ? titleOf(running[0]) : "";

  // A session's Done toast staged on load, held for its capture.
  const stagedDone = React.useRef(false);
  React.useEffect(() => {
    if (staged !== "done-for-today" || stagedDone.current || !loop) return;
    const id = [...view.sessionNext.keys()].find(
      (slotId) => view.states.get(slotId) === "done",
    );
    if (!id) return;
    stagedDone.current = true;
    toastUndo({
      text: doneText(id),
      durationMs: Infinity,
      onUndo: () => void loop.reopen(id),
    });
  });

  // The row gestures (USE-70).
  const menuData = useWorkMenu(view.dateKey, view);
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;
  const [hintGone, closeHint] = useDismissed("today-swipe-hint", "forever");
  const stagedSwipe = staged?.startsWith("swipe:") ? staged.slice(6) : null;
  const [menuFor, setMenuFor] = React.useState<string | null>(() =>
    staged?.startsWith("menu:") ? staged.slice(5) : null,
  );
  const swipeable =
    !atDesk &&
    toggleFiring !== undefined &&
    view.tiers.some((group) =>
      group.rows.some((row) => row.form === "idle" || row.form === "next"),
    );
  const tierOf = (id: string) =>
    view.tiers.find((group) => group.rows.some((row) => row.id === id))?.tier;

  async function moveToTier(id: string, tier: WorkTier) {
    const item = view.workItemIds.get(id);
    // A session with others to come asks This session or All, in its sheet.
    if (item && menuData.asksForTier(id)) {
      router.push(`${itemSheetRoute(here, item)}&step=ask:${tier}`, {
        scroll: false,
      });
      return;
    }
    const written = await menuData.setTier(id, tier);
    toastUndo({
      text: COPY.menu.movedTo(titleOf(id), TIER_WORDS[tier]),
      onUndo: () => void menuData.undo(written),
    });
  }

  async function backToPool(id: string) {
    const title = titleOf(id);
    const written = await menuData.backToPool(id);
    if (written)
      toastUndo({
        text: COPY.menu.backInPool(title),
        onUndo: () => void menuData.undo(written),
      });
  }

  // A row lifts and takes drops at the desk only (USE-71).
  const dragRow = (id: string, title: string, node: React.ReactNode) =>
    atDesk && loop ? (
      <RowDrag
        dragId={TODAY_DRAG.row(id)}
        dropId={TODAY_DRAG.before(id)}
        label={title}
      >
        {node}
      </RowDrag>
    ) : (
      node
    );

  const wrapRow = (row: WorkRowView, node: React.ReactNode) => {
    if (!loop || row.form === "done") return node;
    const firing = row.form === "firing";
    const url = menuData.urlOf(row.id);
    const current = tierOf(row.id);
    return dragRow(
      row.id,
      row.title,
      <WorkMenu
        atDesk={atDesk}
        open={menuFor === row.id}
        onOpenChange={(open) => setMenuFor(open ? row.id : null)}
        clone={<WorkMenuLift row={row} />}
        view={{
          label: COPY.menu.label(row.title),
          more: COPY.menu.more(row.title),
          start: COPY.menu.start,
          fire: firing ? COPY.menu.bringBack : COPY.menu.promptSent,
          firing,
          done: COPY.menu.done,
          moveToTier: COPY.menu.moveToTier,
          tiers: (Object.keys(TIER_WORDS) as WorkTier[]).map((tier) => ({
            tier,
            word: TIER_WORDS[tier],
            current: tier === current,
          })),
          moveToDay: COPY.menu.moveToDay,
          backToPool: COPY.menu.backToPool,
          openInLinear: url ? COPY.menu.openInLinear : null,
        }}
        actions={{
          onStart: () => void start?.(row.id),
          onFire: () => toggleFiring?.(row.id, !firing),
          onDone: () => void done?.(row.id),
          onMoveToTier: (tier) => void moveToTier(row.id, tier),
          onMoveToDay: () => onOpen?.(row.id),
          onBackToPool: () => void backToPool(row.id),
          onOpenInLinear: () => {
            if (url) window.open(url, "_blank", "noopener");
          },
        }}
      >
        {atDesk ? (
          node
        ) : (
          <SwipeToFire
            word={COPY.promptSent}
            disabled={firing || !toggleFiring}
            onFire={() => {
              toggleFiring?.(row.id, true);
              closeHint();
            }}
            staged={stagedSwipe === row.id ? SWIPE_REVEAL_PX : undefined}
          >
            {node}
          </SwipeToFire>
        )}
      </WorkMenu>,
    );
  };

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
        content: dragRow(
          hand.slotId,
          hand.row.title,
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
            onResume={start ? () => void start(hand.slotId) : undefined}
            onPromptSent={
              toggleFiring ? () => toggleFiring(hand.slotId, true) : undefined
            }
            onDone={done ? () => void done(hand.slotId) : undefined}
            onOpen={onOpen}
          />,
        ),
      }
    : next
      ? {
          rowId: next.id,
          content: dragRow(
            next.id,
            next.title,
            <NextCard
              row={next}
              words={{
                start: view.nextResumes ? COPY.resume : COPY.start,
                done: COPY.done,
                doneName: COPY.doneName(next.title),
                next: COPY.next,
              }}
              onStart={start ? () => void start(next.id) : undefined}
              onDone={done ? () => void done(next.id) : undefined}
              onToggleFiring={toggleFiring}
              onOpen={onOpen}
            />,
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
      {swipeable && !hintGone ? (
        <SwipeHint
          text={COPY.swipeHint}
          closeName={COPY.swipeHintClose}
          onClose={closeHint}
        />
      ) : null}
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
      {view.tiers.map((group) => {
        const tierGroup = (
          <TierGroup
            key={group.tier}
            tier={group.tier}
            word={group.word}
            rows={group.rows}
            headingAs={headingAs}
            helper={group.helper}
            add={
              unplanned
                ? null
                : addFor(group.tier, group.word, group.rows.length === 0)
            }
            empty={emptyRow(group.tier, group.word)}
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
            wrapRow={wrapRow}
          />
        );
        // Urgent with nothing in it draws nothing, so takes no drop.
        return atDesk &&
          loop &&
          !(group.tier === "urgent" && group.rows.length === 0) ? (
          <TierDrop key={group.tier} dropId={TODAY_DRAG.end(group.tier)}>
            {tierGroup}
          </TierDrop>
        ) : (
          tierGroup
        );
      })}
      <WaitingGroup
        heading={TODAY_WORK_COPY.waiting}
        rows={view.waiting}
        headingAs={headingAs}
        onOpen={onOpen}
      />
      <StartWhileOneRuns
        open={asking !== null && running !== undefined}
        title={COPY.askTitle(asking ? titleOf(asking) : "")}
        lead={COPY.askLead(runningTitle)}
        groupName={COPY.askGroup(runningTitle)}
        options={{
          firing: { word: COPY.askFiring, line: COPY.askFiringLine },
          paused: { word: COPY.askPaused, line: COPY.askPausedLine },
        }}
        cancel={COPY.cancel}
        start={COPY.start}
        onCancel={() => setAsking(null)}
        onStart={(moveTo: StartMoveTo) => {
          const id = asking;
          setAsking(null);
          if (id && loop) void loop.startMoving(id, moveTo);
        }}
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
