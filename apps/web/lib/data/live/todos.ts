import type { z } from "zod";
import {
  removedTodoInput,
  todoDoneInput,
  todoInput,
  todoUpdateInput,
} from "@syn/validators";
import { TodoWriteRefusal } from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * To-dos, live (USE-95): `todo.*`. The To-dos tray, the To-do sheet and
 * Now's To-dos block read and write the account's rows. Each input is parsed
 * here first, so a bad one is refused "invalid" with the schema's words, as
 * the fixture refuses it. Delete hands back what went (and a `planner.undo`
 * token beside it); the toast's Undo sends it back through `restoreTodo`.
 */

function parsed<S extends z.ZodTypeAny>(schema: S, raw: unknown): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new TodoWriteRefusal(
      "invalid",
      result.error.issues[0]?.message ?? "Invalid to-do.",
    );
  }
  return result.data;
}

export const todosDomain = {
  name: "todos",
  methods: (client) => {
    const t = client.todo;
    return {
      readTodos: (dateKey) => callLive("todo", () => t.list.query({ dateKey })),
      writeTodo: async (raw) =>
        callLive("todo", () => t.create.mutate(parsed(todoInput, raw))),
      updateTodo: async (raw) =>
        callLive("todo", () => t.update.mutate(parsed(todoUpdateInput, raw))),
      writeTodoDone: async (raw) =>
        callLive("todo", () => t.setDone.mutate(parsed(todoDoneInput, raw))),
      removeTodo: (id) => callLive("todo", () => t.remove.mutate({ id })),
      restoreTodo: async (raw) =>
        callLive("todo", () => t.restore.mutate(parsed(removedTodoInput, raw))),
    };
  },
} satisfies LiveDomain;
