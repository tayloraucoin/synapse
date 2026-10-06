/**
 * SY-02's signal — a new version is waiting.
 *
 * SAME SHAPE AS `lib/auth/session-expired.ts`, and for the same reason: the
 * thing that DETECTS an update is a service-worker event listener, which is
 * outside React and cannot call a Context setter. A module-level flag with
 * subscribers, read through `useSyncExternalStore`, is what `useOnline` and
 * `useDeviceZone` already do in this app, and it does not spend the second
 * Zustand store on something that fires once per deploy.
 *
 * IT HOLDS THE WAITING WORKER, not just a boolean. *Reload* has to post
 * `SKIP_WAITING` to that exact registration, and looking it up again at tap
 * time would race a third deploy — the ticket's own edge case. Holding the
 * reference means the tap uses the worker the line was raised for, and the
 * `location.reload()` fallback covers the case where it has since gone.
 *
 * IT LATCHES ON PURPOSE. The update line has no dismiss (cross-cutting §5.4) —
 * a new version is a fact, not a suggestion — so there is no path that clears
 * this except the reload it asks for, which ends the page.
 */

let waiting: ServiceWorker | null = null;
let ready = false;
const listeners = new Set<() => void>();

/** Called by the registration leaf when a worker reaches `installed`. */
export function publishUpdateReady(worker: ServiceWorker | null): void {
  // A later deploy replaces the reference but does not re-notify: the line is
  // already up and says the same thing.
  waiting = worker;
  if (ready) return;
  ready = true;
  for (const listener of listeners) listener();
}

export function subscribeUpdateReady(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readUpdateReady(): boolean {
  return ready;
}

/** The server has no worker and never has an update to offer. */
export function serverUpdateReady(): boolean {
  return false;
}

/**
 * *Reload* — skip waiting, then reload when the new worker takes over.
 *
 * NOTHING IS PERSISTED FIRST, and that is a statement about Phase 1 rather than
 * an omission. Cross-cutting §5.4 says local state is persisted before the
 * reload; in this app there is no local-only state to lose — a running timer is
 * a `timer_sessions` row that USE-3 re-seeds the store from on the next read,
 * form drafts already persist on change through `useLocalDraft`, and everything
 * else came from the server. If a screen ever holds unsaved local state, it
 * has to persist it here before this function is allowed to run.
 *
 * THE RELOAD IS ON `controllerchange`, NOT ON A TIMER. The point is to come
 * back running the new version; reloading before the new worker has taken over
 * would just reload the old one. The listener is registered BEFORE the message
 * is posted, or a fast activation would fire it before anyone is listening.
 */
export function reloadForUpdate(): void {
  if (typeof window === "undefined") return;

  if (waiting === null || !("serviceWorker" in navigator)) {
    // The worker is gone — a third deploy, or a browser that never had one.
    // Reloading anyway is what the person asked for and lands them on
    // whatever is current.
    window.location.reload();
    return;
  }

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => window.location.reload(),
    { once: true },
  );

  waiting.postMessage({ type: "SKIP_WAITING" });
}
