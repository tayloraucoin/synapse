import type { QueryClient } from "@tanstack/react-query";
import type { Persister } from "@tanstack/react-query-persist-client";
import { clearShellCache } from "@/lib/pwa/shell-cache";

/**
 * Sign-out empties the device (USE-106): the paused writes, every query, and
 * the persisted copy of both, and the cached shell documents (USE-107). Called by the sign-out itself before it posts,
 * never by a screen. Writes still waiting offline are dropped with the rest
 * [ASSUMPTION: the person chose to leave; a queue kept for the next account
 * would replay one person's taps as another's].
 */
export async function clearOfflineStore(
  queryClient: QueryClient,
  persister: Pick<Persister, "removeClient">,
): Promise<void> {
  queryClient.getMutationCache().clear();
  queryClient.getQueryCache().clear();
  await Promise.all([persister.removeClient(), clearShellCache()]);
}
