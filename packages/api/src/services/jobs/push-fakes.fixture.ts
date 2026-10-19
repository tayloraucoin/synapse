import type { BuiltPayload } from "../notifications/build-payload";
import { atMinute } from "../notifications/deliver";
import type { PushDeps } from "./push-window";

/**
 * The deliveries table in memory: a claim on a key already held is a
 * duplicate, as `notification_deliveries_key` makes it (USE-105's tests).
 */
export function memoryPush(): PushDeps & {
  sent: Array<{ rowIds: readonly string[]; payload: BuiltPayload }>;
} {
  const keys = new Set<string>();
  const sent: Array<{ rowIds: readonly string[]; payload: BuiltPayload }> = [];
  return {
    sent,
    async claim(target) {
      const key = [
        target.kind,
        target.targetId,
        target.targetKey,
        atMinute(target.scheduledFor).toISOString(),
      ].join("|");
      if (keys.has(key)) return "duplicate";
      keys.add(key);
      return { id: key };
    },
    async send(rowIds, payload) {
      sent.push({ rowIds, payload });
    },
  };
}
