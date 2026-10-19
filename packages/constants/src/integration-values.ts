/**
 * The integrations' value lists (USE-100): the one spelling of each enum
 * `0016_use_integrations` creates. `@syn/db` builds its pgEnums from these,
 * and `@syn/validators` reads the same lists for the outbox's view.
 */

/** linear_writes.kind: what the outbox writes to Linear (D-USE-113), never the assignee. */
export const LINEAR_WRITE_KINDS = [
  "status",
  "done",
  "reopen",
  "priority",
  "description",
  "estimate",
] as const;

/** linear_writes.state: a `failed` row shows "Not updated in Linear." */
export const LINEAR_WRITE_STATES = ["pending", "sent", "failed"] as const;
