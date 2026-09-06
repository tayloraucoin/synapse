"use client";

import * as React from "react";

import { useAppTheme } from "@syn/ui";

import { trpc } from "@/lib/trpc/client";

/**
 * Reconciles the account's theme with this device's.
 *
 * TWO STORES, ONE AUTHORITY. `users.theme` is the cross-device source; next-
 * themes' `localStorage` entry is the per-device cache that lets the page
 * paint the right colours before any JavaScript asks a server. Neither can be
 * dropped: without the row a person's choice does not follow them to a second
 * browser, and without the cache every cold open flashes the wrong theme.
 *
 * THE ACCOUNT WINS, ONCE PER SESSION. This applies the stored value when it
 * differs from the local one and then stops, guarded by a ref. Running it on
 * every render would fight ST-09 — the control writes both, and a sync that
 * re-read a stale query result would flip the theme back a moment after
 * someone chose it.
 *
 * It renders nothing. It is mounted in the shell layout because that is the
 * first place a signed-in person is, and the only place that is true of.
 */
export function ThemeSync() {
  const { theme, setTheme } = useAppTheme();
  const me = trpc.user.me.useQuery(undefined, { retry: false });
  const applied = React.useRef(false);

  React.useEffect(() => {
    if (applied.current) return;
    const stored = me.data?.theme;
    if (stored === undefined) return;

    applied.current = true;
    if (stored !== theme) setTheme(stored);
  }, [me.data?.theme, theme, setTheme]);

  return null;
}
