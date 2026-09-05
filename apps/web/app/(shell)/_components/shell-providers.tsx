"use client";

import * as React from "react";

import { AppShell } from "./app-shell";
import { ShellStateProvider, useShell } from "./shell-context";

/**
 * The client half of the signed-in frame.
 *
 * The layout above is a Server Component and does the gate; this holds the
 * shell's small shared state and the chrome that reads it. Split here because
 * `sheetOpen` has to reach `AppShell` (to dim the tab bar) and a sheet deep in
 * a page (to set it), and the only thing both can see is a context provider
 * above them both.
 *
 * `user` is the server's first-paint value, so the header's avatar and name
 * are correct in the first frame rather than appearing a beat later. The live
 * value comes from `shell.status` in the header itself.
 */
export function ShellProviders({
  user,
  reviewHasPending,
  children,
}: {
  user: { name: string; imageUrl: string | null };
  reviewHasPending: boolean;
  children: React.ReactNode;
}) {
  return (
    <ShellStateProvider>
      <ShellChrome user={user} reviewHasPending={reviewHasPending}>
        {children}
      </ShellChrome>
    </ShellStateProvider>
  );
}

/** Inside the provider, so it can read `sheetOpen`. */
function ShellChrome({
  user,
  reviewHasPending,
  children,
}: {
  user: { name: string; imageUrl: string | null };
  reviewHasPending: boolean;
  children: React.ReactNode;
}) {
  const { sheetOpen } = useShell();

  return (
    <AppShell
      user={user}
      reviewHasPending={reviewHasPending}
      sheetOpen={sheetOpen}
    >
      {children}
    </AppShell>
  );
}
