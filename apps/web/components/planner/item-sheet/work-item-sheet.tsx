"use client";

/**
 * WorkItemSheet — the Item sheet on a work item (USE-65; day/item-sheet,
 * size-and-length.md, work-more-open.md). ItemSheet hands over when the
 * id is a work item; the route, the close and the focus return are its.
 *
 * NO SAVE. Size, Length, Tier and Notes save as made (`useWorkItemSheet`).
 *
 * THE FOOT. Start and Done for the date's session, once the day has begun
 * and while it is not firing (C-USE-item-sheet-linear-linked-1); a session's
 * Done reads "Done for today". Both are the work loop's (USE-59, USE-60):
 * Start that meets another item running opens the same ask Today does, and
 * Done writes the session's or the task's Done with its Undo. The sheet
 * writes no clock event of its own.
 *
 * ···. On the phone a step in this sheet, as the action sheet draws it; at
 * the desk a pull-down (D-USE-103). Each of its writes closes the sheet and
 * toasts with Undo [ASSUMPTION, as the state file].
 *
 * LINEAR (USE-66). A linked item carries the Linear line under its name and
 * Priority, Assignee and Description under Tier. The status chip opens the
 * status list as a step in this sheet; a pick writes to Linear, takes its
 * consequence here and goes back to the fields ("start" is the work loop's
 * Start). ··· adds Unlink from Linear, which asks nothing and toasts with
 * Undo; the sheet stays, on a plain item.
 *
 * A SESSION (USE-67; tier-and-sessions.md): Tier for this session first,
 * then Sessions and Sub-issues. A tier change with other open sessions asks
 * This session or All sessions (SessionTierAsk) before anything is written;
 * Add a day and a sub-issue's Place are PlaceSubIssueStep. Each is a step in
 * this sheet, as ··· is, so no second sheet stacks; leaving a step writes
 * nothing and focus goes back where it came from.
 *
 * WHILE FIRING (while-firing.md, D-USE-44): the firing panel under the name,
 * its figures from the derived clock at the tick, and Bring back and Done
 * at the foot. Bring back writes `brought_back` alone: firing stops and work
 * time waits for Start.
 *
 * LINK A LINEAR ISSUE (USE-68; linear-search.md, linear-off.md): an
 * unlinked item carries ConnectLinearRow under its name. It opens
 * LinkLinearStep, a step in this sheet with back on the left; a tap links,
 * goes back to the fields (now the linked item's) and toasts with Undo,
 * which puts the item back exactly. With Linear not connected the row reads
 * "Connect Linear" and goes to Settings, Connections (USE-85 gives it its
 * own path); Back returns here.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useWorkClock } from "@syn/hooks";
import type { WorkTier } from "@syn/types";
import {
  Button,
  CloseIcon,
  ItemIcon,
  MoreIcon,
  ResponsiveSheet,
  toastUndo,
  useIsSplit,
} from "@syn/ui";
import { weekdayIndex } from "@syn/utils";
import {
  rangeWords,
  shortDate,
  shortDay,
} from "@/components/work/add/new-task/form";
import type { DayPickChip } from "@/components/work/day-pick";
import { SpreadDialog, SpreadSheet } from "@/components/work/spread";
import {
  StartWhileOneRuns,
  type StartMoveTo,
} from "@/components/work/start-while-one-runs";
import type { LinkRow } from "@/lib/data/item-sheet-link";
import {
  allSessionsFits,
  canPickDay,
  dayFit,
  firingPanel,
  sessionTop,
  subIssueTop,
  type DayFit,
  type DayPick,
  type SubIssueView,
} from "@/lib/data/item-sheet-sessions";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import { useWorkItemSheet } from "@/lib/data/use-item-sheet";
import { useTodayWork, useWorkLoop } from "@/lib/data/use-today-work";
import { connectionsRoute } from "@/lib/routes";
import { MoveToStep, seededMovePick } from "../move-to";
import { ConnectLinearRow } from "./connect-linear-row";
import { clock, ITEM_SHEET_COPY } from "./copy";
import { FiringPanel } from "./firing-panel";
import { LinearFields } from "./linear-fields";
import { LinearLine, LinearLineStatus } from "./linear-line";
import { LinkLinearStep } from "./link-linear-step";
import { PlaceSubIssueStep } from "./place-sub-issue-step";
import { SessionTierAsk } from "./session-tier-ask";
import { SessionsField } from "./sessions-field";
import { StatusList } from "./status-list";
import { SubIssuesField } from "./sub-issues-field";
import { scopeWords, WorkItemFields } from "./work-item-fields";
import { WorkMoreList, WorkMoreMenu, workMoreRows } from "./work-more";

const COPY = ITEM_SHEET_COPY.work;
const SESSIONS = ITEM_SHEET_COPY.sessions;
const STEP = ITEM_SHEET_COPY.dayStep;

const WEEKDAY_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const WEEKDAY_LETTER = ["M", "T", "W", "T", "F", "S", "S"];

/** The sheet's own steps beside ···: the ask, Place, Add a day (USE-67). */
type SheetStep =
  | { kind: "ask"; tier: WorkTier }
  | { kind: "place"; issueId: string }
  | { kind: "add" }
  | { kind: "link" }
  | { kind: "move" };

/** `view.open` from a scenario: "item:ask:<tier>", "item:place", "item:add", "item:link". */
function seededSheetStep(open: string | undefined): string | null {
  if (open === undefined || !open.startsWith("item:")) return null;
  return open.slice("item:".length);
}

/** The pick's chips: "Thursday 15", "Saturday 17, no Work block". */
function chipsOf(picks: readonly DayPick[]): DayPickChip[] {
  return picks.map((pick) => {
    const index = weekdayIndex(pick.dateKey);
    const long = `${WEEKDAY_LONG[index]} ${Number(pick.dateKey.slice(8))}`;
    const why =
      pick.block === null
        ? STEP.noWork
        : pick.past
          ? STEP.past
          : pick.taken
            ? STEP.taken
            : null;
    return {
      dateKey: pick.dateKey,
      letter: WEEKDAY_LETTER[index]!,
      date: Number(pick.dateKey.slice(8)),
      name: why === null ? long : `${long}, ${why}`,
      disabled: !canPickDay(pick),
    };
  });
}

/** "Thu's Secondary runs to 11:20 at the top of its ranges." */
function fitWords(
  day: string | null,
  tier: WorkTier,
  fit: DayFit | null,
): string {
  if (day === null || fit === null) return STEP.pickADay;
  const word = COPY.tier[tier];
  if (fit.runsTo === null) return STEP.noTop(word);
  return `${STEP.runsTo(shortDay(day), word, fit.runsTo)}${
    fit.fits ? "" : STEP.pastEnd(fit.endsAt)
  }.`;
}

/** A scenario's `view.open` on a linked item: the status list, or Priority open. */
function seededLinear(open: string | undefined): "status" | "priority" | null {
  return open === "item:status" || open === "item:priority"
    ? (open.slice("item:".length) as "status" | "priority")
    : null;
}

export interface WorkItemSheetProps {
  open: boolean;
  id: string;
  /** Closes the sheet and its route; ItemSheet's. */
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
  /** ··· open on load, for `?state=item-work-more-open`. */
  seededMore: boolean;
  /** Move to open on load (USE-69), for `?state=move-linear`. */
  seededMove?: boolean;
}

export function WorkItemSheet({
  open,
  id,
  onClose,
  returnFocusRef,
  seededMore,
  seededMove = false,
}: WorkItemSheetProps) {
  const source = useDataSource();
  const dateKey = source.todayKey();
  const sheet = useWorkItemSheet(id);
  const { view } = sheet;
  const now = useWorkClock(source.now);
  const work = useTodayWork(dateKey, now);
  const loop = useWorkLoop(dateKey, work.view);
  const atDesk = useIsSplit();
  const router = useRouter();
  const offline = useIsOffline();
  const seededStep = seededLinear(source.scenario.view?.open);
  const [statusAsked, setStatusOpen] = React.useState(false);
  // The work menu's tier move on a session (USE-70) arrives as `&step=ask:<tier>`.
  const [urlStep, setUrlStep] = useQueryState("step");
  const seedStep =
    seededSheetStep(source.scenario.view?.open) ??
    (urlStep?.startsWith("ask:") ? urlStep : null);

  const [moreAsked, setMore] = React.useState(false);
  // ··· › Spread across the week (USE-78): the full sheet below 1024 in this
  // one's place, the dialog at the desk; × comes back here.
  const [spreading, setSpreading] = React.useState(false);
  // The step is the phone's; at the desk ··· is a pull-down (D-USE-103).
  const more = moreAsked && !atDesk;
  const [asking, setAsking] = React.useState(false);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const seeded = React.useRef(false);
  const [step, setStep] = React.useState<SheetStep | null>(null);
  // The one-day step's picks, set as it opens.
  const [pickDay, setPickDay] = React.useState<string | null>(null);
  const [pickTier, setPickTier] = React.useState<WorkTier>("secondary");
  const tierRef = React.useRef<HTMLDivElement>(null);
  const backTo = React.useRef<HTMLElement | null>(null);

  // ··· open on load: the step on the phone; the desk's menu opens itself.
  React.useEffect(() => {
    if (!open || seeded.current || view === null) return;
    seeded.current = true;
    if (seededMore) setMore(true);
    if (seededMove) setStep({ kind: "move" });
    if (seededStep === "status") setStatusOpen(true);
  }, [open, view, seededMore, seededMove, seededStep]);

  // A scenario's step: the ask, Place on its first open sub-issue, Add a day.
  const seededSteps = React.useRef(false);
  // The seed reads the latest openPlace and openAdd, which read the latest view.
  const opens = React.useRef({ openPlace, openAdd });
  React.useLayoutEffect(() => {
    opens.current = { openPlace, openAdd };
  });
  const ready = view !== null && sheet.week !== null;
  React.useEffect(() => {
    if (!open || seededSteps.current || !ready || seedStep === null) return;
    if (seedStep.startsWith("ask:")) {
      seededSteps.current = true;
      setStep({ kind: "ask", tier: seedStep.slice(4) as WorkTier });
      if (urlStep !== null) void setUrlStep(null);
    } else if (seedStep === "place") {
      const sub = sheet.subIssues.find((row) => !row.done);
      if (!sub) return;
      seededSteps.current = true;
      opens.current.openPlace(sub, null);
    } else if (seedStep === "add") {
      seededSteps.current = true;
      opens.current.openAdd();
    } else if (seedStep === "link") {
      seededSteps.current = true;
      setStep({ kind: "link" });
    }
  }, [open, ready, seedStep, sheet.subIssues, urlStep, setUrlStep]);

  // Each opening and each step focuses its heading; back out of a step,
  // focus returns where it came from instead (leaveStep).
  const loaded = view !== null;
  const returning = React.useRef(false);
  React.useEffect(() => {
    if (!open || !loaded) return;
    if (returning.current) {
      returning.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, more, statusAsked, loaded, step]);

  function close() {
    setMore(false);
    setStatusOpen(false);
    setStep(null);
    onClose();
  }

  /** Out of a step, focus back where it came from: the tier, ···, Add a day. */
  function leaveStep() {
    const back = step?.kind === "ask" ? null : backTo.current;
    returning.current = true;
    setStep(null);
    requestAnimationFrame(() => {
      if (back?.isConnected) back.focus();
      else {
        const tier = tierRef.current;
        (
          tier?.querySelector<HTMLElement>("input:checked") ??
          tier?.querySelector<HTMLElement>("input")
        )?.focus();
      }
    });
  }

  function openPlace(sub: SubIssueView, trigger: HTMLElement | null) {
    const at = sheet.view;
    if (at === null) return;
    backTo.current = trigger;
    const picks = sheet.picks();
    const pickable = (date: string | undefined) =>
      picks.find((pick) => pick.dateKey === date && canPickDay(pick))
        ?.dateKey ?? null;
    // Placed: where it is; else with the issue's last open share [ASSUMPTION].
    const last = at.sessions.filter((row) => !row.done).at(-1)?.dateKey;
    setPickDay(
      pickable(sub.placed?.dateKey) ??
        pickable(last) ??
        picks.find(canPickDay)?.dateKey ??
        null,
    );
    setPickTier(sub.placed?.tier ?? at.slot?.tier ?? "secondary");
    setStep({ kind: "place", issueId: sub.issueId });
  }

  function openLink(trigger: HTMLElement | null) {
    backTo.current = trigger;
    setStep({ kind: "link" });
  }

  function openAdd(trigger: HTMLElement | null = null) {
    const at = sheet.view;
    if (at === null) return;
    backTo.current = trigger;
    const picks = sheet.picks(at.sessions.map((row) => row.dateKey));
    setPickDay(picks.find(canPickDay)?.dateKey ?? null);
    setPickTier(at.slot?.tier ?? "secondary");
    setStep({ kind: "add" });
  }

  if (view === null) return null;
  const { slot, item } = view;
  const linear = sheet.linear;
  const statusOpen = statusAsked && linear !== null;
  const loopView = work.view;
  const state = slot ? loopView?.states.get(slot.id) : undefined;
  const foot =
    slot !== null &&
    slot.today &&
    view.ready &&
    !slot.done &&
    loopView !== null &&
    state !== "done";
  const firing =
    slot !== null && loopView !== null && state === "firing"
      ? firingPanel(
          loopView.clocks.get(slot.id),
          now,
          loopView.dayEnd,
          loopView.timeZone,
        )
      : null;
  // A spread task asks before changing the others (D-USE-57).
  const othersOpen = view.sessions.some((row) => !row.thisOne && !row.done);
  const focused = view.session !== null || firing !== null;
  const tierAside =
    slot === null || !focused
      ? undefined
      : view.session !== null
        ? SESSIONS.tierAside(shortDate(slot.dateKey))
        : shortDate(slot.dateKey);
  const oneDay = slot
    ? (loopView?.oneDay.get(slot.id) ?? view.session === null)
    : true;

  const titleOf = (slotId: string) =>
    sheet.titleOf(loopView?.workItemIds.get(slotId) ?? "");
  const running = loopView
    ? [...loopView.states].find(
        ([slotId, value]) => slotId !== slot?.id && value === "running",
      )
    : undefined;
  const runningTitle = running ? titleOf(running[0]) : "";

  async function start() {
    if (slot === null) return;
    if ((await loop.start(slot.id)) === "asks") {
      setAsking(true);
      return;
    }
    close();
  }

  function startMoving(moveTo: StartMoveTo) {
    setAsking(false);
    if (slot === null) return;
    close();
    void loop.startMoving(slot.id, moveTo);
  }

  async function done() {
    if (slot === null || loopView === null) return;
    const next = loopView.sessionNext.get(slot.id) ?? null;
    const text = loopView.sessionNext.has(slot.id)
      ? COPY.toast.doneForToday(
          next ? { n: next.n, day: shortDate(next.dateKey) } : null,
        )
      : COPY.toast.done(item.title);
    close();
    const undo = await loop.done(slot.id);
    if (undo) toastUndo({ text, onUndo: () => void undo() });
  }

  function bringBack() {
    if (slot === null) return;
    void loop.bringBack(slot.id);
  }

  function changeTier(tier: WorkTier) {
    if (slot === null || tier === slot.tier) return;
    if (view !== null && view.session !== null && othersOpen) {
      setStep({ kind: "ask", tier });
      return;
    }
    void sheet.setTier(tier);
  }

  async function moveTier(tier: WorkTier, choice: "this" | "all") {
    leaveStep();
    await sheet.setTier(tier, choice);
  }

  async function drop(slotId: string) {
    const session = view?.sessions.find((row) => row.slotId === slotId);
    const written = await sheet.dropSession(slotId);
    if (written === null || !session) return;
    toastUndo({
      text: SESSIONS.toast.dropped(shortDate(session.dateKey)),
      onUndo: () => void sheet.undo(written),
    });
  }

  async function act(
    write: () => ReturnType<typeof sheet.markTaskDone>,
    text: string,
  ) {
    close();
    const written = await write();
    if (written === null) return;
    toastUndo({ text, onUndo: () => void sheet.undo(written) });
  }

  async function pickStatus(stateId: string) {
    setStatusOpen(false);
    const effect = await sheet.setStatus(stateId);
    // In progress starts the timer, as Start does, once the day has begun.
    if (effect === "start" && foot && state !== "running") await start();
  }

  async function link(row: LinkRow) {
    leaveStep();
    const written = await sheet.link({
      connectionId: row.connectionId,
      issueId: row.issueId,
    });
    if (written === null) return;
    toastUndo({
      text: ITEM_SHEET_COPY.link.toast.linked(row.identifier, written.joined),
      onUndo: () => void sheet.undoLink(written),
    });
  }

  type PlannerWritten = Parameters<typeof sheet.undoPlanner>[0];

  async function plannerAct(
    write: () => Promise<PlannerWritten | null>,
    text: string,
    closes: boolean,
  ) {
    if (closes) close();
    const written = await write();
    if (written === null) return;
    toastUndo({ text, onUndo: () => void sheet.undoPlanner(written) });
  }

  const rows = workMoreRows(view, {
    onMarkDone: () =>
      void act(sheet.markTaskDone, COPY.toast.taskDone(item.title)),
    onBackToPool: () =>
      void act(sheet.backToPool, COPY.toast.backToPool(item.title)),
    onSpread: () => {
      setMore(false);
      setSpreading(true);
    },
    onOpenInLinear: () => {
      if (item.url !== null) window.open(item.url, "_blank", "noopener");
    },
    onRemove: () =>
      void act(sheet.removeFromSynapse, COPY.toast.removed(item.title)),
    ...(linear === null
      ? {}
      : {
          onUnlink: () =>
            void plannerAct(
              sheet.unlink,
              ITEM_SHEET_COPY.linear.toast.unlinked(item.title),
              false,
            ),
          onMoveTo: () => setStep({ kind: "move" }),
          onNotToday: () =>
            void plannerAct(
              sheet.notToday,
              ITEM_SHEET_COPY.toast.offToday(item.title),
              true,
            ),
        }),
  });

  const closeButton = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={ITEM_SHEET_COPY.close}
      onClick={close}
      className="-ms-(--space-3)"
    >
      <CloseIcon aria-hidden="true" />
    </Button>
  );

  // The ask, the link step and Move to carry their own way back.
  const ownBack =
    step?.kind === "ask" || step?.kind === "link" || step?.kind === "move";
  const header =
    more || statusOpen || ownBack ? null : (
      <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
        {closeButton}
        <span className="flex-1" />
        {step !== null ? null : atDesk ? (
          <WorkMoreMenu view={view} rows={rows} defaultOpen={seededMore} />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={COPY.more(item.title)}
            aria-expanded={false}
            onClick={() => setMore(true)}
          >
            <span
              aria-hidden="true"
              className="bg-surface text-foreground flex size-8 items-center justify-center rounded-full"
            >
              <MoreIcon className="size-4" />
            </span>
          </Button>
        )}
      </div>
    );

  const footer =
    foot && !more && !statusOpen && step === null ? (
      <div className="grid grid-cols-2 gap-(--space-3)">
        {state === "firing" ? (
          <Button variant="secondary" size="lg" onClick={bringBack}>
            {ITEM_SHEET_COPY.firing.bringBack}
          </Button>
        ) : state === "running" ? (
          <span />
        ) : (
          <Button variant="secondary" size="lg" onClick={() => void start()}>
            {COPY.start}
          </Button>
        )}
        <Button size="lg" onClick={() => void done()}>
          {oneDay ? COPY.done : COPY.doneForToday}
        </Button>
      </div>
    ) : undefined;

  const week = sheet.week;
  const workItems = sheet.workItems;
  let stepBody: React.ReactNode = null;
  if (step?.kind === "ask" && slot !== null) {
    const others = allSessionsFits({
      view,
      tier: step.tier,
      days: week?.days ?? [],
      workItems,
      slots: sheet.slots,
      timeZone: week?.timeZone ?? source.scenario.records.timeZone,
    });
    const tierWord = COPY.tier[step.tier];
    const allLine =
      others.length === 0
        ? SESSIONS.ask.already(tierWord)
        : others
            .map(({ dateKey, fit }) =>
              fit === null || fit.runsTo === null
                ? SESSIONS.ask.movesToo(shortDay(dateKey))
                : `${SESSIONS.ask.ends(shortDay(dateKey), fit.runsTo)}${
                    fit.fits ? "" : STEP.pastEnd(fit.endsAt)
                  }`,
            )
            .join("; ");
    const openSessions = view.sessions.filter((row) => !row.done);
    stepBody = (
      <SessionTierAsk
        title={SESSIONS.ask.title(tierWord)}
        lead={SESSIONS.ask.lead(
          item.title,
          openSessions.length,
          openSessions.map((row) => shortDate(row.dateKey)).join(", "),
        )}
        thisLine={SESSIONS.ask.thisOnly(shortDate(slot.dateKey))}
        allLine={allLine}
        headingRef={titleRef}
        onMove={(choice) => void moveTier(step.tier, choice)}
      />
    );
  } else if (step?.kind === "move") {
    stepBody = (
      <MoveToStep
        itemRef={item.id}
        from="sheet"
        onBack={leaveStep}
        onDone={close}
        seededPick={seededMovePick(source.scenario.view?.open)}
      />
    );
  } else if (step?.kind === "link") {
    const linkScope =
      slot === null || !slot.today
        ? scopeWords(view)
        : [
            slot.blockName,
            `${clock(slot.startsAt)} to ${clock(slot.endsAt)}`,
            slot.tier === null ? null : COPY.tier[slot.tier],
          ]
            .filter((part) => part !== null)
            .join(" · ");
    stepBody = (
      <LinkLinearStep
        itemTitle={item.title}
        scope={linkScope}
        list={sheet.linkList}
        person={sheet.assignee}
        offline={offline}
        onPick={(row) => void link(row)}
        onBack={leaveStep}
        headingRef={titleRef}
      />
    );
  } else if (step?.kind === "place" || step?.kind === "add") {
    const sub =
      step.kind === "place"
        ? sheet.subIssues.find((row) => row.issueId === step.issueId)
        : undefined;
    const picks =
      step.kind === "add"
        ? sheet.picks(view.sessions.map((row) => row.dateKey))
        : sheet.picks();
    const pick = picks.find((row) => row.dateKey === pickDay);
    const record = workItems.find((row) => row.id === item.id);
    const top =
      step.kind === "add"
        ? record
          ? sessionTop(record, null)
          : view.topMin
        : subIssueTop(sub?.estimate ?? null, sub?.estimationType);
    const fit =
      pick && canPickDay(pick)
        ? dayFit({
            days: week?.days ?? [],
            dateKey: pick.dateKey,
            tier: pickTier,
            topMin: top,
            // What moves rather than adds: the sub-issue's own slot, or this item's.
            ...(step.kind === "add"
              ? { leaveOut: item.id }
              : sub?.workItemId
                ? { leaveOut: sub.workItemId }
                : {}),
            workItems,
            timeZone: week?.timeZone ?? source.scenario.records.timeZone,
          })
        : null;
    const day = pick && canPickDay(pick) ? pick.dateKey : null;
    const place = async () => {
      if (day === null || !pick?.block) return;
      const target = { dateKey: day, blockId: pick.block.id, tier: pickTier };
      leaveStep();
      const written =
        step.kind === "add"
          ? await sheet.addSessionDay(target)
          : sub
            ? await sheet.placeSubIssue(sub, target)
            : null;
      if (written === null) return;
      toastUndo({
        text:
          step.kind === "add"
            ? SESSIONS.toast.added(shortDate(day))
            : SESSIONS.toast.placed(sub?.title ?? "", shortDate(day)),
        onUndo: () => void sheet.undo(written),
      });
    };
    stepBody = (
      <PlaceSubIssueStep
        scope={
          step.kind === "place" ? (
            <>
              {STEP.scope(linear?.identifier ?? "", "")}
              <ItemIcon icon={item.icon} size={20} />
              {item.title}
            </>
          ) : undefined
        }
        title={
          step.kind === "place" ? STEP.title(sub?.title ?? "") : STEP.addTitle
        }
        lead={step.kind === "place" ? STEP.lead : STEP.addLead(item.title)}
        chips={chipsOf(picks)}
        day={day}
        onDay={setPickDay}
        tier={pickTier}
        onTier={setPickTier}
        line={fitWords(day, pickTier, fit)}
        action={
          step.kind === "place"
            ? STEP.place(day === null ? "" : shortDate(day))
            : STEP.add(day === null ? "" : shortDate(day))
        }
        canAct={day !== null && (step.kind === "add" || sub !== undefined)}
        onAct={() => void place()}
        headingRef={titleRef}
      />
    );
  }

  return (
    <>
      <ResponsiveSheet
        open={open && !spreading}
        onOpenChange={(next) => {
          if (next) return;
          // Out of ···'s or the status step goes back to the fields; out of the fields, closed.
          if (more) setMore(false);
          else if (statusOpen) setStatusOpen(false);
          else if (step !== null) leaveStep();
          else close();
        }}
        title={item.title}
        header={header}
        headerAction={null}
        footer={footer}
        returnFocusRef={returnFocusRef}
        size={
          more ||
          (step !== null && step.kind !== "link" && step.kind !== "move")
            ? "default"
            : "tall"
        }
        classes={{
          header:
            more || statusOpen || ownBack
              ? "hidden"
              : "items-center pt-(--space-2)",
          body: "pt-(--space-1)",
        }}
      >
        {step !== null ? (
          stepBody
        ) : more ? (
          <WorkMoreList
            view={view}
            rows={rows.map((row) => ({
              ...row,
              onSelect: () => {
                setMore(false);
                row.onSelect?.();
              },
            }))}
            headingRef={titleRef}
          />
        ) : statusOpen && linear !== null ? (
          <StatusList
            title={item.title}
            identifier={linear.identifier}
            workspace={linear.workspace}
            groups={linear.groups}
            currentId={linear.current.id}
            onPick={(stateId) => void pickStatus(stateId)}
            onBack={() => setStatusOpen(false)}
            headingRef={titleRef}
          />
        ) : (
          <WorkItemFields
            // A link or an unlink reads the item afresh: Exact or Range from its new length.
            key={`${item.id}:${item.linked}`}
            view={
              linear === null
                ? view
                : { ...view, item: { ...item, size: linear.size } }
            }
            titleRef={titleRef}
            onSize={(size) => void sheet.setSize(size)}
            onLength={(range) => void sheet.setLength(range)}
            onTier={changeTier}
            onNotes={(notes) => void sheet.setNotes(notes)}
            // Move to moves today's session (USE-69); elsewhere the row only reads.
            onWhen={slot?.today ? () => setStep({ kind: "move" }) : undefined}
            linear={
              linear === null
                ? item.linked || sheet.linearConnected === null
                  ? undefined
                  : {
                      line: (
                        <ConnectLinearRow
                          connected={sheet.linearConnected}
                          onLink={() =>
                            openLink(
                              document.activeElement as HTMLElement | null,
                            )
                          }
                          onConnect={() => router.push(connectionsRoute())}
                        />
                      ),
                      fields: null,
                    }
                : {
                    line: (
                      <>
                        <LinearLine
                          status={linear.current}
                          identifier={linear.identifier}
                          project={linear.project}
                          url={linear.url}
                          onStatus={() => setStatusOpen(true)}
                          issueTitle={
                            linear.title === item.title ? null : linear.title
                          }
                        />
                        <LinearLineStatus
                          line={linear.line}
                          onRetry={(writeId) => void sheet.retryLinear(writeId)}
                        />
                      </>
                    ),
                    fields: (
                      <LinearFields
                        priority={linear.priority}
                        onPriority={(priority) =>
                          void sheet.setPriority(priority)
                        }
                        priorityOpen={seededStep === "priority"}
                        assignee={sheet.assignee}
                        assigneePhoto={sheet.assigneePhoto}
                        description={linear.description}
                        onDescription={(text) =>
                          void sheet.setDescription(text)
                        }
                      />
                    ),
                  }
            }
            focused={focused}
            firing={firing ? <FiringPanel view={firing} /> : undefined}
            tierAside={tierAside}
            asksTier={view.session !== null && othersOpen}
            tierRef={tierRef}
            extra={
              <>
                {view.session === null ? null : (
                  <SessionsField
                    sessions={view.sessions}
                    range={rangeWords(item.lengthMinMin, item.lengthMaxMin)}
                    onDrop={(slotId) => void drop(slotId)}
                    onAddDay={() =>
                      openAdd(document.activeElement as HTMLElement | null)
                    }
                  />
                )}
                {sheet.subIssues.length === 0 ? null : (
                  <SubIssuesField
                    subIssues={sheet.subIssues}
                    onCheck={(sub, done) => void sheet.checkSubIssue(sub, done)}
                    onPlace={openPlace}
                  />
                )}
              </>
            }
          />
        )}
      </ResponsiveSheet>
      {atDesk ? (
        <SpreadDialog
          workItemId={open && spreading ? item.id : null}
          card={null}
          onClose={() => setSpreading(false)}
        />
      ) : (
        <SpreadSheet
          workItemId={open && spreading ? item.id : null}
          onClose={() => setSpreading(false)}
          onSpread={() => {
            setSpreading(false);
            close();
          }}
        />
      )}
      <StartWhileOneRuns
        open={asking && running !== undefined}
        title={COPY.ask.title(item.title)}
        lead={COPY.ask.lead(runningTitle)}
        groupName={COPY.ask.group(runningTitle)}
        options={{
          firing: { word: COPY.ask.firing, line: COPY.ask.firingLine },
          paused: { word: COPY.ask.paused, line: COPY.ask.pausedLine },
        }}
        cancel={COPY.ask.cancel}
        start={COPY.ask.start}
        onCancel={() => setAsking(false)}
        onStart={startMoving}
      />
    </>
  );
}
