import type { z } from "zod";
import {
  createTaskInput,
  editWorkItemInput,
  workItemIdInput,
} from "@syn/validators";
import { PlannerRefusal } from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * The work pool, live (USE-98): `work.*`. The pool, New task, the Item sheet
 * and Today's Done read and write the account's work items: the pool read,
 * create, edit, done, reopen, back to the pool and remove. Each input is
 * parsed here first, so a bad one is refused "invalid" with the schema's
 * words, as the fixture refuses it, before any call. Every write hands back
 * `{ undo, id? }`, and its Undo goes through `planner.undo`. Placing and
 * moving sessions stay on fixtures until USE-99, the Linear snapshot and
 * placing issues until USE-101.
 */

function parsed<S extends z.ZodTypeAny>(schema: S, raw: unknown): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new PlannerRefusal(
      "invalid",
      result.error.issues[0]?.message ?? "Invalid input.",
    );
  }
  return result.data;
}

/** One write: the input parsed, then the call, its refusal mapped. */
function send<T>(parse: () => unknown, call: (input: never) => Promise<T>) {
  try {
    const input = parse();
    return callLive("planner", () => call(input as never));
  } catch (error) {
    return Promise.reject(error);
  }
}

export const workDomain: LiveDomain = {
  name: "work",
  methods: (client) => {
    const w = client.work;
    return {
      readPool: () => callLive("planner", () => w.pool.query()),
      createTask: (raw) =>
        send(
          () => parsed(createTaskInput, raw),
          (input) => w.createTask.mutate(input),
        ),
      editWorkItem: (raw) =>
        send(
          () => parsed(editWorkItemInput, raw),
          (input) => w.editWorkItem.mutate(input),
        ),
      markTaskDone: (raw) =>
        send(
          () => parsed(workItemIdInput, raw),
          (input) => w.markTaskDone.mutate(input),
        ),
      reopenTask: (raw) =>
        send(
          () => parsed(workItemIdInput, raw),
          (input) => w.reopenTask.mutate(input),
        ),
      backToPool: (raw) =>
        send(
          () => parsed(workItemIdInput, raw),
          (input) => w.backToPool.mutate(input),
        ),
      removeFromSynapse: (raw) =>
        send(
          () => parsed(workItemIdInput, raw),
          (input) => w.removeFromSynapse.mutate(input),
        ),
    };
  },
};
