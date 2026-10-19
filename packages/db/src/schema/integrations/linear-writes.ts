/**
 * linear_writes — the outbox (USE-100's table, USE-102's sender). Synapse's
 * value is written first and stands; a row carries the change to the issue.
 * `failed` shows "Not updated in Linear." with Try again. `kind` is
 * D-USE-113's six, never the assignee. Gone with its connection or its item.
 *
 * POLICIES: owner-private CRUD.
 */
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { ownerPrivateCrudPolicies } from "../rls/standard-policies";
import { users } from "../user/users";
import { workItems } from "../work/work-items";
import { linearWriteKindEnum, linearWriteStateEnum } from "./enums";
import { linearConnections } from "./linear-connections";

export const linearWrites = pgTable(
  "linear_writes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    attempts: smallint("attempts").notNull().default(0),
    /** Linear's issue id. */
    issueId: text("issue_id").notNull(),
    kind: linearWriteKindEnum("kind").notNull(),
    lastError: text("last_error"),
    // JSON shape: the change for `kind` (the state id, priority, text or estimate).
    payload: jsonb("payload").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    state: linearWriteStateEnum("state").notNull().default("pending"),

    connectionId: uuid("connection_id")
      .notNull()
      .references(() => linearConnections.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workItemId: uuid("work_item_id")
      .notNull()
      .references(() => workItems.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("linear_writes_connection_id_state_idx").on(
      table.connectionId,
      table.state,
    ),
    index("linear_writes_user_id_idx").on(table.userId),
    index("linear_writes_work_item_id_idx").on(table.workItemId),
    ...ownerPrivateCrudPolicies({
      prefix: "linear_writes",
      ownerColumn: sql`${table.userId}`,
    }),
  ],
);
