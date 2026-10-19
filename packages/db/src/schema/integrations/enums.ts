/**
 * The outbox's two enums (USE-100, `0016`). Spelled once in `@syn/constants`;
 * `enumValues` proves the tuple whole.
 */
import { pgEnum } from "drizzle-orm/pg-core";
import { LINEAR_WRITE_KINDS, LINEAR_WRITE_STATES } from "@syn/constants";
import { enumValues } from "../enum-values";

type LinearWriteKind = (typeof LINEAR_WRITE_KINDS)[number];
type LinearWriteState = (typeof LINEAR_WRITE_STATES)[number];

/** D-USE-113: status, done, reopen, priority, description, estimate. */
export const linearWriteKindEnum = pgEnum(
  "linear_write_kind",
  enumValues<LinearWriteKind>()(LINEAR_WRITE_KINDS),
);

export const linearWriteStateEnum = pgEnum(
  "linear_write_state",
  enumValues<LinearWriteState>()(LINEAR_WRITE_STATES),
);
