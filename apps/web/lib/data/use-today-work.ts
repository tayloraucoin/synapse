"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SlotEventKind } from "@syn/types";
import { clockAt, tookMinutes, weekKeyOf } from "@syn/utils";
import { slotEventFor } from "./running";
import { useDataSource } from "./source";
import { deriveTodayWork, todayTodos, type TodayWorkView } from "./today-work";
import { useClients } from "./use-clients";
import { useLinear } from "./use-linear";
import { useSlotEvents } from "./use-slot-events";
import { todayQueryKey, useToday } from "./use-today";
import { useTodos } from "./use-todos";
import { useWeekView } from "./use-week-view";
import { useWorkWrites } from "./use-work-writes";

/**
 * Today's work (USE-57): `useToday`'s records and clock, the Week's view of
 * the date (each session's place), Linear's issues and the clients, read into
 * `deriveTodayWork`'s one view; the To-dos beside it. `now` is the screen's
 * one tick, so the firing minutes and the header's time move with it and
 * nothing counts in a component.
 *
 * The tiers wait for the day and the Week's read alike [ASSUMPTION: a
 * session's "1 of 3" is the Week's, counted over the pool]; either failing is
 * Today's tiers failing, and `retry` reads both again.
 */
export function useTodayWork(dateKey: string, now: Date) {
  const today = useToday(dateKey);
  const week = useWeekView(weekKeyOf(dateKey));
  const { clientFor } = useClients();
  const { issueFor, subIssuesFor } = useLinear();
  const todos = useTodos(dateKey);

  // Firing reads whole minutes: the view is derived again on the minute.
  const minute = Math.floor(now.getTime() / 60_000);
  const day =
    week.view?.days.find((entry) => entry.dateKey === dateKey) ?? null;
  // Derived each render from data the queries hold; cheap, and never stored.
  const view =
    today.today !== undefined && day !== null
      ? deriveTodayWork({
          today: today.today,
          day,
          now: new Date(minute * 60_000),
          clientFor,
          issueFor,
          subIssuesFor,
        })
      : null;
  const todoRows = React.useMemo(
    () =>
      todos.rows && today.today
        ? todayTodos(todos.rows, today.today.records.todos)
        : null,
    [todos.rows, today.today],
  );

  return {
    view,
    todos: todoRows,
    isError: today.isError || week.isError,
    retry: () => {
      void today.retry();
      void week.retry();
    },
    checkTodo: (id: string, checked: boolean) =>
      void (checked ? todos.check(id) : todos.uncheck(id)),
  };
}

/** Start meets a running item: nothing is written; the ask is USE-60's. */
export type StartResult = "written" | "asks";

/** The loop's actions that are one slot event each. */
export type LoopAction = "start" | "pause" | "promptSent" | "bringBack";

/**
 * The event an action writes on `slotId`, or "asks" when Start meets another
 * item running inside the Work block (C-USE-today-4; the ask is USE-60's).
 * Start writes `resumed` on an item that has worked today. Every way to fire
 * is one `prompt_sent` (C-USE-firing-1); bringing back is `brought_back`
 * alone, never a start (C-USE-firing-3). Pure over the view, so a test reads
 * the rule the screen keeps.
 */
export function loopEvent(
  view: TodayWorkView,
  action: LoopAction,
  slotId: string,
): SlotEventKind | "asks" {
  switch (action) {
    case "start": {
      const meets = [...view.states].some(
        ([id, state]) => id !== slotId && state === "running",
      );
      if (meets) return "asks";
      const worked = (view.clocks.get(slotId)?.work.length ?? 0) > 0;
      return worked ? "resumed" : "started";
    }
    case "pause":
      return "paused";
    case "promptSent":
      return "prompt_sent";
    case "bringBack":
      return "brought_back";
  }
}

/** Done's slot change: done at `at`, work time only, none when it never ran (D-USE-48). */
export function doneChange(view: TodayWorkView, slotId: string, at: Date) {
  const clock = view.clocks.get(slotId);
  const workMs = clock ? clockAt(clock, at, view.dayEnd).workMs : 0;
  return {
    doneAt: at.toISOString(),
    tookMin: workMs > 0 ? tookMinutes(workMs) : null,
  };
}

/**
 * The work loop's writes on Today (USE-59; interactions/firing.md): each is
 * one `useSlotEvents` batch, and the clock is derived again from the events.
 * Every way to fire (the card's Prompt sent, the ring on any row, and later
 * F, the swipe and the menu) is `promptSent`: one `prompt_sent`, the same
 * result (C-USE-firing-1). Bringing back writes `brought_back` alone, never a
 * start (C-USE-firing-3). Start and Resume refuse while another item runs
 * inside the block, so the loop never writes two in hand (C-USE-today-4).
 *
 * Done writes `done`, then the slot's `doneAt` and `tookMin` (work time
 * only), and on a one-day item the task's Done (USE-55's `markTaskDone`);
 * its Undo puts back each step, last first. A session's Done is USE-60's.
 */
export function useWorkLoop(dateKey: string, view: TodayWorkView | null) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const events = useSlotEvents(dateKey);
  const work = useWorkWrites();

  const write = (slotId: string, kind: SlotEventKind, at = source.now()) =>
    events.mutateAsync([slotEventFor(slotId, kind, at)]);

  async function act(action: LoopAction, slotId: string): Promise<StartResult> {
    if (!view) return "asks";
    const kind = loopEvent(view, action, slotId);
    if (kind === "asks") return "asks";
    await write(slotId, kind);
    return "written";
  }

  async function done(slotId: string) {
    if (!view) return null;
    const at = source.now();
    const change = doneChange(view, slotId, at);
    await write(slotId, "done", at);
    await source.server.writeSlots({ id: slotId, ...change });
    const workItemId = view.workItemIds.get(slotId);
    const task =
      workItemId && view.oneDay.get(slotId)
        ? await work.markTaskDone({ workItemId })
        : null;
    void queryClient.invalidateQueries({
      queryKey: todayQueryKey(source.scenario.name),
    });
    return async () => {
      if (task) await work.undo(task.undo);
      await source.server.writeSlots({
        id: slotId,
        doneAt: null,
        tookMin: null,
      });
      await write(slotId, "undone");
    };
  }

  return {
    /** Start, or Resume when it has worked today; "asks" writes nothing. */
    start: (slotId: string) => act("start", slotId),
    resume: (slotId: string) => act("start", slotId),
    pause: (slotId: string) => act("pause", slotId),
    /** The card's Prompt sent and the ring alike; F, swipe and menu later. */
    promptSent: (slotId: string) => act("promptSent", slotId),
    bringBack: (slotId: string) => act("bringBack", slotId),
    /** Done; resolves to its Undo. */
    done,
  };
}
