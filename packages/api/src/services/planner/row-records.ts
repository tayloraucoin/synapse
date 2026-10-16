import type { z } from "zod";

/**
 * A Drizzle row as its `@syn/validators` record (USE-91): instants as ISO
 * strings, then the record's own parse, which drops Postgres's seconds from
 * a `time`, strips `user_id` and any other column the record does not name,
 * and fails loudly on a column the record needs and the row lacks.
 */
export function recordOf<S extends z.ZodTypeAny>(
  schema: S,
  row: Record<string, unknown>,
): z.infer<S> {
  const plain: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    plain[key] = value instanceof Date ? value.toISOString() : value;
  }
  return schema.parse(plain);
}

export function recordsOf<S extends z.ZodTypeAny>(
  schema: S,
  rows: readonly Record<string, unknown>[],
): z.infer<S>[] {
  return rows.map((row) => recordOf(schema, row));
}
