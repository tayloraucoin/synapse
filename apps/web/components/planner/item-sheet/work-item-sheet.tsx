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
 */
import * as React from "react";
import { useWorkClock } from "@syn/hooks";
import {
  Button,
  CloseIcon,
  MoreIcon,
  ResponsiveSheet,
  toastUndo,
  useIsSplit,
} from "@syn/ui";
import { shortDate } from "@/components/work/add/new-task/form";
import {
  StartWhileOneRuns,
  type StartMoveTo,
} from "@/components/work/start-while-one-runs";
import { useDataSource } from "@/lib/data/source";
import { useWorkItemSheet } from "@/lib/data/use-item-sheet";
import { useTodayWork, useWorkLoop } from "@/lib/data/use-today-work";
import { ITEM_SHEET_COPY } from "./copy";
import { LinearFields } from "./linear-fields";
import { LinearLine, LinearLineStatus } from "./linear-line";
import { StatusList } from "./status-list";
import { WorkItemFields } from "./work-item-fields";
import { WorkMoreList, WorkMoreMenu, workMoreRows } from "./work-more";

const COPY = ITEM_SHEET_COPY.work;

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
  /** When's row: Move to (USE-69). */
  onMoveTo?: (id: string) => void;
}

export function WorkItemSheet({
  open,
  id,
  onClose,
  returnFocusRef,
  seededMore,
  onMoveTo,
}: WorkItemSheetProps) {
  const source = useDataSource();
  const dateKey = source.todayKey();
  const sheet = useWorkItemSheet(id);
  const { view } = sheet;
  const now = useWorkClock(source.now);
  const work = useTodayWork(dateKey, now);
  const loop = useWorkLoop(dateKey, work.view);
  const atDesk = useIsSplit();
  const seededStep = seededLinear(source.scenario.view?.open);
  const [statusAsked, setStatusOpen] = React.useState(false);

  const [moreAsked, setMore] = React.useState(false);
  // The step is the phone's; at the desk ··· is a pull-down (D-USE-103).
  const more = moreAsked && !atDesk;
  const [asking, setAsking] = React.useState(false);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const seeded = React.useRef(false);

  // ··· open on load: the step on the phone; the desk's menu opens itself.
  React.useEffect(() => {
    if (!open || seeded.current || view === null) return;
    seeded.current = true;
    if (seededMore) setMore(true);
    if (seededStep === "status") setStatusOpen(true);
  }, [open, view, seededMore, seededStep]);

  // Each opening and each step focuses its heading.
  const loaded = view !== null;
  React.useEffect(() => {
    if (!open || !loaded) return;
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, more, statusAsked, loaded]);

  function close() {
    setMore(false);
    setStatusOpen(false);
    onClose();
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
    state !== "firing" &&
    state !== "done";
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
          onMoveTo: () => onMoveTo?.(item.id),
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

  const header =
    more || statusOpen ? null : (
      <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
        {closeButton}
        <span className="flex-1" />
        {atDesk ? (
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
    foot && !more && !statusOpen ? (
      <div className="grid grid-cols-2 gap-(--space-3)">
        {state === "running" ? (
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

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          if (next) return;
          // Out of ···'s or the status step goes back to the fields; out of the fields, closed.
          if (more) setMore(false);
          else if (statusOpen) setStatusOpen(false);
          else close();
        }}
        title={item.title}
        header={header}
        headerAction={null}
        footer={footer}
        returnFocusRef={returnFocusRef}
        size={more ? "default" : "tall"}
        classes={{
          header: more || statusOpen ? "hidden" : "items-center pt-(--space-2)",
          body: "pt-(--space-1)",
        }}
      >
        {more ? (
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
            view={
              linear === null
                ? view
                : { ...view, item: { ...item, size: linear.size } }
            }
            titleRef={titleRef}
            onSize={(size) => void sheet.setSize(size)}
            onLength={(range) => void sheet.setLength(range)}
            onTier={(tier) => void sheet.setTier(tier)}
            onNotes={(notes) => void sheet.setNotes(notes)}
            onWhen={onMoveTo ? () => onMoveTo(item.id) : undefined}
            linear={
              linear === null
                ? undefined
                : {
                    line: (
                      <>
                        <LinearLine
                          status={linear.current}
                          identifier={linear.identifier}
                          project={linear.project}
                          url={linear.url}
                          onStatus={() => setStatusOpen(true)}
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
          />
        )}
      </ResponsiveSheet>
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
