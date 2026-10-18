/**
 * The writes a router refuses, each with the reason it gives (USE-90). The
 * fixture server throws them; the live server maps a refused `TRPCError`
 * back to the same class (`live/errors.ts`), so the refusal words a surface
 * draws are the same from either. They live here, not in `lib/fixtures`,
 * so the live path never loads a fixture module to name one.
 */

export type SlotEventRefusalReason =
  "invalid" | "unknown-slot" | "before-day" | "after-day" | "ahead-of-now";

/** A write the router would refuse, with the reason it would give. */
export class SlotEventRefusal extends Error {
  readonly reason: SlotEventRefusalReason;

  constructor(reason: SlotEventRefusalReason, message: string) {
    super(message);
    this.name = "SlotEventRefusal";
    this.reason = reason;
  }
}

/** A saved colour write the router would refuse (USE-11). */
export class SavedColourRefusal extends Error {
  readonly reason: "invalid" | "unknown" | "duplicate";

  constructor(reason: SavedColourRefusal["reason"], message: string) {
    super(message);
    this.name = "SavedColourRefusal";
    this.reason = reason;
  }
}

/** A meal topic write the router would refuse (USE-22). */
export class MealTopicRefusal extends Error {
  readonly reason: "invalid" | "unknown";

  constructor(reason: MealTopicRefusal["reason"], message: string) {
    super(message);
    this.name = "MealTopicRefusal";
    this.reason = reason;
  }
}

/** A slot write the router would refuse (USE-16). */
export class SlotWriteRefusal extends Error {
  readonly reason: "invalid" | "unknown" | "duplicate";

  constructor(reason: SlotWriteRefusal["reason"], message: string) {
    super(message);
    this.name = "SlotWriteRefusal";
    this.reason = reason;
  }
}

/** A name the user router would refuse: empty, or past the cap. */
export class AccountNameRefusal extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountNameRefusal";
  }
}

/** A to-do write the router would refuse (USE-19). */
export class TodoWriteRefusal extends Error {
  readonly reason: "invalid" | "unknown" | "past-day";

  constructor(reason: TodoWriteRefusal["reason"], message: string) {
    super(message);
    this.name = "TodoWriteRefusal";
    this.reason = reason;
  }
}

/** A journal write the router would refuse (USE-44). */
export class JournalWriteRefusal extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JournalWriteRefusal";
  }
}

/** A morning-lines write the router would refuse. */
export class MorningLinesRefusal extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MorningLinesRefusal";
  }
}

export type PlannerRefusalReason =
  "invalid" | "unknown" | "duplicate" | "not-on-date";

/** A planner write the router would refuse, in the schema's words. */
export class PlannerRefusal extends Error {
  readonly reason: PlannerRefusalReason;

  constructor(reason: PlannerRefusalReason, message: string) {
    super(message);
    this.name = "PlannerRefusal";
    this.reason = reason;
  }
}

/**
 * A write with no connection (a scenario's `offline`): it waits on the
 * device. Here with the refusals (USE-108), so a hook names it without
 * loading a fixture.
 */
export class FixtureOfflineError extends Error {
  constructor() {
    super("No connection.");
    this.name = "FixtureOfflineError";
  }
}
