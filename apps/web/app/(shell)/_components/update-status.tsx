"use client";

import * as React from "react";
import { UpdateLine } from "@syn/ui";
import { useDataSource } from "@/lib/data/source";
import {
  readUpdateReady,
  reloadForUpdate,
  serverUpdateReady,
  subscribeUpdateReady,
} from "@/lib/pwa/update-ready";
import { SHELL_COPY as COPY } from "./copy";

/**
 * SY-02's line in the rebuilt shell (USE-114): _A new version is ready._ ·
 * _Reload_, while a new build's worker waits behind the one in control.
 *
 * The only one of the legacy status line's sources that comes back with it.
 * Offline is each screen's own line (USE-21); setup, pending review, the late
 * offer, the zone and install went to `_legacy/` with the old app.
 *
 * No dismiss, and no reload without the tap: `update-ready.ts` latches, and
 * `reloadForUpdate` is the line's action and nothing else's. `?state=` stands
 * the waiting worker through the scenario's `updateReady` (canon C-P08).
 */
export function UpdateStatus() {
  const waiting = React.useSyncExternalStore(
    subscribeUpdateReady,
    readUpdateReady,
    serverUpdateReady,
  );
  const standing = useDataSource().scenario.updateReady === true;

  if (!waiting && !standing) return null;

  return (
    <aside aria-label={COPY.statusLabel}>
      <UpdateLine onReload={reloadForUpdate} />
    </aside>
  );
}
