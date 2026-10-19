"use client";

import { useSyncExternalStore } from "react";
import { useOnline } from "@/lib/hooks/use-online";
import { useDataSource, type DataSource } from "./source";

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

/** Whether a write can go now, outside React (USE-34). */
export function isConnected(source: Pick<DataSource, "scenario">): boolean {
  if (source.scenario.offline === true) {
    return reconnected.has(source.scenario.name);
  }
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

/** The scenario's connection is back: its server takes writes again. */
export function reconnectSource(
  source: Pick<DataSource, "scenario" | "server">,
): void {
  source.server.reconnect();
  reconnected.add(source.scenario.name);
  for (const listener of listeners) listener();
}

/**
 * Settles once a write can go (USE-34): at once when connected, else on the
 * scenario's reconnect or the browser's `online`. A write that waits on it
 * is held on the phone, as wave 3's paused mutation will be.
 */
export function whenConnected(
  source: Pick<DataSource, "scenario">,
): Promise<void> {
  if (isConnected(source)) return Promise.resolve();
  return new Promise((resolve) => {
    const check = () => {
      if (!isConnected(source)) return;
      listeners.delete(check);
      if (typeof window !== "undefined") {
        window.removeEventListener("online", check);
      }
      resolve();
    };
    listeners.add(check);
    if (typeof window !== "undefined") {
      window.addEventListener("online", check);
    }
  });
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
  return { online, reconnect: () => reconnectSource(source) };
}
