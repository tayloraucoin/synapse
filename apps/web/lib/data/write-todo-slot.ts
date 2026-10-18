import type { z } from "zod";
import type { placeSlotInput, TodoInput, TodoRecord } from "@syn/validators";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { FixtureServer } from "@/lib/fixtures/server";

/**
 * New to-do in a To-dos block (USE-111): the to-do, then its slot on the
 * date, as one write. The slot needs the to-do's id, so the two travel the
 * planner queue as one call: offline it waits whole, survives a reload as one
 * paused write, and lands once, the to-do before its slot. Both servers
 * answer it with this, over their own `writeTodo` and `placeSlot`.
 */

export interface TodoSlotInput {
  todo: TodoInput;
  slot: Omit<z.input<typeof placeSlotInput>, "todoId">;
}

export interface TodoSlotWrite {
  todo: TodoRecord;
  /** The slot's write; its Undo takes the slot off, not the to-do. */
  write: PlannerWrite;
}

export async function writeTodoSlot(
  server: Pick<FixtureServer, "writeTodo" | "placeSlot">,
  input: TodoSlotInput,
): Promise<TodoSlotWrite> {
  const todo = await server.writeTodo(input.todo);
  const write = await server.placeSlot({ ...input.slot, todoId: todo.id });
  return { todo, write };
}
