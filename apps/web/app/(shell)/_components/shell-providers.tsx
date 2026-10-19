"use client";

import * as React from "react";
import { ResumeGuard } from "@/components/resume-guard";
import {
  SessionExpiredDialog,
  SessionWatcher,
} from "@/components/session-expired-dialog";
import { ThemeSync } from "./theme-sync";

/**
 * The signed-in frame's providers, with no chrome (USE-1).
 *
 * The old rail, tab bar and shell context went to `_legacy/` with the app they
 * served; USE's shell ticket draws the new chrome here. What stays is what any
 * signed-in screen needs: the stored theme applied once, the session watched
 * (and the signed-out dialog when it lapses), and the installed app's resume
 * re-running the entry tree after an hour away.
 */
export function ShellProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeSync />
      <SessionWatcher />
      <SessionExpiredDialog />
      <ResumeGuard />
      {children}
    </>
  );
}
