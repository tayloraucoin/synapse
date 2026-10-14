"use client";

import { useSyncExternalStore } from "react";
import { useOnline } from "@/lib/hooks/use-online";
import { useDataSource } from "./source";

/**
 * Whether writes can reach the server (USE-36; D-USE-82): an offline
 * scenario is offline until reconnected, any other follows the browser
 * (`useOnline`). The reconnect is the fixture network's, not client state:
 * wave 3 reads the browser alone and this file loses the scenario half.
 */

const reconnected = new Set<string>();
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useConnection(): { online: boolean; reconnect: () => void } {
  const source = useDataSource();
  const name = source.scenario.name;
  const browserOnline = useOnline();
  const back = useSyncExternalStore(
    subscribe,
    () => reconnected.has(name),
    () => false,
  );
  const online = source.scenario.offline === true ? back : browserOnline;
  function reconnect() {
    source.server.reconnect();
    reconnected.add(name);
    for (const listener of listeners) listener();
  }
  return { online, reconnect };
}
