"use client";

import { useQueryState } from "nuqs";
import { TodosTray } from "@/components/planner";
import { useDataSource } from "@/lib/data/source";
import { TODAY_TODO_PARAM } from "@/lib/routes";

/**
 * Now's To-dos tray (USE-19): closed by default (D-USE-26); a reminder's tap
 * lands on `?todo=<id>` and opens it on that to-do. A scenario's
 * `view.open` seeds it for a capture: "todos" open, "todos:<id>" as from a
 * reminder, its tint held still.
 */
export function NowTodosTray() {
  const { scenario } = useDataSource();
  const [todo] = useQueryState(TODAY_TODO_PARAM);
  const open = scenario.view?.open;
  const seeded = open?.startsWith("todos:")
    ? open.slice("todos:".length)
    : null;
  return (
    <TodosTray
      focusTodoId={todo ?? seeded}
      defaultOpen={open === "todos"}
      holdTint={seeded !== null && todo === null}
    />
  );
}
