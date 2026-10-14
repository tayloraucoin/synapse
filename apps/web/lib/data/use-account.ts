"use client";

import { useQuery } from "@tanstack/react-query";
import { useDataSource } from "./source";

/**
 * The account behind the avatar (USE-83): the name, the email and the photo,
 * for the header's avatar, the rail footer and the avatar menu's Who. On the
 * fixture server's `readAccount` now; the account wiring (wave 3) swaps the
 * body for the user router. Never sent in any event payload.
 */

export interface AccountView {
  name: string;
  email: string;
  /** A photo the browser can load, or null for the initial on paper. */
  photoUrl: string | null;
}

export function accountQueryKey(scenario: string) {
  return ["account", scenario] as const;
}

export function useAccount() {
  const source = useDataSource();
  return useQuery({
    queryKey: accountQueryKey(source.scenario.name),
    queryFn: () => source.server.readAccount(),
  });
}
