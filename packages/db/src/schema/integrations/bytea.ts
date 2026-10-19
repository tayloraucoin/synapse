/**
 * `bytea`, which drizzle's pg-core has no builder for. postgres-js reads it
 * as a Node `Buffer`. Only the integrations' token ciphertext uses it.
 */
import { customType } from "drizzle-orm/pg-core";

export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});
