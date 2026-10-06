"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import { ResumeGuard } from "@/components/resume-guard";
import { orientRoute } from "@/lib/routes";
import { ShortcutsHost } from "@/components/shortcuts-host";
import {
  SessionExpiredDialog,
  SessionWatcher,
} from "@/components/session-expired-dialog";

import { AppShell } from "./app-shell";
import { ShellStateProvider, useShell } from "./shell-context";
import { ThemeSync } from "./theme-sync";
import { TimerTitle } from "./timer-title";

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
      {/*
       * Renders nothing; applies the account's stored theme once per session.
       * It lives here because this is the first place a signed-in person is,
       * and the only place that is true of.
       */}
      <ThemeSync />
      {/* Also renders nothing; keeps the tab title telling a running timer. */}
      <TimerTitle />
      {/*
       * SY-04. The watcher renders nothing and listens for a session ending
       * while nobody is asking for anything; the dialog is mounted once, here,
       * so every signed-in screen has it and no `(auth)` screen does.
       */}
      <SessionWatcher />
      <SessionExpiredDialog />
      {/*
       * SYS-5. Renders nothing; re-runs the entry tree when the INSTALLED app
       * comes back after more than an hour away.
       */}
      <ResumeGuard />
      {/*
       * SYS-4. One `keydown` listener for the whole app, plus the `?` dialog
       * it opens — both suppressed while a field or a dialog has focus.
       */}
      <ShortcutsHost />
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
  const pathname = usePathname();

  return (
    <AppShell
      user={user}
      reviewHasPending={reviewHasPending}
      sheetOpen={sheetOpen}
      bare={pathname === orientRoute()}
    >
      {children}
    </AppShell>
  );
}
