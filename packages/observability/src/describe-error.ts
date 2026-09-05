import type { LogPayload } from "./logging";

type PostgresErrorFields = {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  schema?: string;
};

/**
 * Serialize an unknown error for structured logs / debug payloads.
 * Unwraps postgres.js / Drizzle pg fields and nested `cause` chains.
 */
export function describeError(error: unknown): LogPayload {
  if (!(error instanceof Error)) {
    return { raw: String(error) };
  }

  const pg = error as Error & PostgresErrorFields;

  const described: LogPayload = {
    name: error.name,
    message: error.message,
  };

  if (pg.code) described.pgCode = pg.code;
  if (pg.detail) described.pgDetail = pg.detail;
  if (pg.constraint) described.pgConstraint = pg.constraint;
  if (pg.table) described.pgTable = pg.table;
  if (pg.schema) described.pgSchema = pg.schema;
  if (error.cause) described.cause = describeError(error.cause);

  return described;
}
