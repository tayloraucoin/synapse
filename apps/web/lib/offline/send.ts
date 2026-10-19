import type { SlotEventInput } from "@syn/validators";
import { getDataSource, LIVE_SCENARIO } from "@/lib/data/source";
import { whenConnected } from "@/lib/data/use-connection";
import type { OfflineWrite, WriteCall } from "./writes";

/**
 * The offline writes' one sender (USE-106), what each default calls: the
 * scenario's source, then its server's method. In a fixture scenario that is
 * offline the planner's writes wait for the reconnect, as USE-36's queue held
 * them; the fixtures' clock and work writes never waited, and still do not.
 * A live write is never held here: TanStack pauses it, and a paused write is
 * the one that is persisted.
 */
export async function sendWrite(
  write: OfflineWrite,
  scenario: string,
  variables: unknown,
): Promise<unknown> {
  const source = getDataSource(scenario === LIVE_SCENARIO ? null : scenario);
  if (!source.live && write === "planner") await whenConnected(source);
  if (write === "slotEvents") {
    return source.server.writeSlotEvents(variables as SlotEventInput[]);
  }
  const { method, args } = variables as WriteCall;
  const fn = source.server[method as keyof typeof source.server] as unknown as (
    ...a: readonly unknown[]
  ) => Promise<unknown>;
  return fn(...args);
}
