import type { z } from "zod";
import {
  createTaskInput,
  editWorkItemInput,
  linkToLinearInput,
  moveWorkInput,
  placeIssuesInput,
  placeOnDaysInput,
  placeWorkInput,
  setWorkTierInput,
  spreadWorkInput,
  unplaceWorkInput,
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
 * `{ undo, id? }`, and its Undo goes through `planner.undo`. USE-99 adds
 * the sessions: place, place on several days, move, unplace, spread and a
 * tier change. USE-101 adds From Linear's place, Link and Unlink, each
 * planned over the latest Linear snapshot.
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

export const workDomain = {
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
      placeWork: (raw) =>
        send(
          () => parsed(placeWorkInput, raw),
          (input) => w.placeWork.mutate(input),
        ),
      placeOnDays: (raw) =>
        send(
          () => parsed(placeOnDaysInput, raw),
          (input) => w.placeOnDays.mutate(input),
        ),
      moveWork: (raw) =>
        send(
          () => parsed(moveWorkInput, raw),
          (input) => w.moveWork.mutate(input),
        ),
      unplaceWork: (raw) =>
        send(
          () => parsed(unplaceWorkInput, raw),
          (input) => w.unplaceWork.mutate(input),
        ),
      spreadWork: (raw) =>
        send(
          () => parsed(spreadWorkInput, raw),
          (input) => w.spreadWork.mutate(input),
        ),
      setWorkTier: (raw) =>
        send(
          () => parsed(setWorkTierInput, raw),
          (input) => w.setWorkTier.mutate(input),
        ),
      placeIssues: (raw) =>
        send(
          () => parsed(placeIssuesInput, raw),
          (input) => w.placeIssues.mutate(input),
        ),
      linkToLinear: (raw) =>
        send(
          () => parsed(linkToLinearInput, raw),
          (input) => w.linkToLinear.mutate(input),
        ),
      unlinkFromLinear: (raw) =>
        send(
          () => parsed(workItemIdInput, raw),
          (input) => w.unlinkFromLinear.mutate(input),
        ),
    };
  },
} satisfies LiveDomain;
