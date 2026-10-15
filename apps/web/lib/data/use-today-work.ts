"use client";

import * as React from "react";
import { weekKeyOf } from "@syn/utils";
import { deriveTodayWork, todayTodos } from "./today-work";
import { useClients } from "./use-clients";
import { useLinear } from "./use-linear";
import { useToday } from "./use-today";
import { useTodos } from "./use-todos";
import { useWeekView } from "./use-week-view";

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
