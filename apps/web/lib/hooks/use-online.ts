/**
 * useOnline — whether the browser thinks it can reach the network.
 *
 * Feeds the shell's offline status line (nav & system §6.2). It is
 * `navigator.onLine`, which is a weak signal — it says the interface is up,
 * not that the server is reachable — and that is the honest limit: the line it
 * drives says "changes save on this device", which is true whenever the
 * request fails, and false-negatives cost nothing.
 *
 * `useSyncExternalStore` rather than an effect: the server snapshot is `true`,
 * so the offline line never renders on the server and then disappears.
 */
"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
