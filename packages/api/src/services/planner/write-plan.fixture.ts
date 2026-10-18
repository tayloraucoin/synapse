import { TRPCError } from "@trpc/server";
import { expect } from "vitest";
import { refusalReason } from "../../errors";
import type { PlannerRows } from "./planner-rows";
import { id, rows } from "./planner-rows.fixture";
import { WriteJournal } from "./write-journal";

/**
 * The write tests' harness (USE-92): a journal over rows in memory on a
 * fixed clock, Saturday 17 October 2026 at 08:00 in Vancouver, and a check
 * that a plan refuses with the fixture's reason and words.
 */

export const NOW = new Date("2026-10-17T15:00:00.000Z");
export const NOW_ISO = NOW.toISOString();

export function journalOver(over: Partial<PlannerRows> = {}): WriteJournal {
  return new WriteJournal(rows(over), { now: () => NOW, newId: id });
}

export function expectRefusal(
  run: () => unknown,
  reason: string,
  message: string,
) {
  let thrown: unknown;
  try {
    run();
  } catch (error) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(TRPCError);
  expect(refusalReason(thrown as TRPCError)).toBe(reason);
  expect((thrown as TRPCError).message).toBe(message);
}
