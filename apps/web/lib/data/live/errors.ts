import {
  AccountNameRefusal,
  JournalWriteRefusal,
  MealTopicRefusal,
  MorningLinesRefusal,
  PlannerRefusal,
  SavedColourRefusal,
  SlotEventRefusal,
  SlotWriteRefusal,
  TodoWriteRefusal,
  type PlannerRefusalReason,
  type SlotEventRefusalReason,
} from "@/lib/data/refusals";

/**
 * A refused call, back to the class the fixture server throws (USE-90). The
 * server's `refuse(reason, message)` reaches the client as a `BAD_REQUEST`
 * whose `data.refusal` is the reason; a domain's method names its class by
 * kind (`callLive("planner", …)`), so the refusal words a surface already
 * draws show unchanged.
 */

type MakeRefusal = (reason: string, message: string) => Error;

const REFUSALS = {
  planner: (reason, message) =>
    new PlannerRefusal(reason as PlannerRefusalReason, message),
  slotEvent: (reason, message) =>
    new SlotEventRefusal(reason as SlotEventRefusalReason, message),
  slotWrite: (reason, message) =>
    new SlotWriteRefusal(reason as SlotWriteRefusal["reason"], message),
  savedColour: (reason, message) =>
    new SavedColourRefusal(reason as SavedColourRefusal["reason"], message),
  mealTopic: (reason, message) =>
    new MealTopicRefusal(reason as MealTopicRefusal["reason"], message),
  todo: (reason, message) =>
    new TodoWriteRefusal(reason as TodoWriteRefusal["reason"], message),
  accountName: (_reason, message) => new AccountNameRefusal(message),
  journal: (_reason, message) => new JournalWriteRefusal(message),
  morningLines: (_reason, message) => new MorningLinesRefusal(message),
} satisfies Record<string, MakeRefusal>;

export type RefusalKind = keyof typeof REFUSALS;

/** The reason a tRPC client error carries, read by shape (`data.refusal`). */
function refusalOf(error: unknown): string | null {
  if (!(error instanceof Error)) return null;
  const data = (error as { data?: { refusal?: unknown } | null }).data;
  return typeof data?.refusal === "string" ? data.refusal : null;
}

/** A refused error as its refusal class; any other error as it came. */
export function toRefusal(error: unknown, kind: RefusalKind): unknown {
  const reason = refusalOf(error);
  if (reason === null) return error;
  return REFUSALS[kind](reason, (error as Error).message);
}

/** One live call, its refusal mapped: `callLive("planner", () => client.…)`. */
export async function callLive<T>(
  kind: RefusalKind,
  call: () => Promise<T>,
): Promise<T> {
  try {
    return await call();
  } catch (error) {
    throw toRefusal(error, kind);
  }
}
