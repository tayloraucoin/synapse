"use client";

import * as React from "react";

import { useShell } from "@/app/(shell)/_components/shell-context";

/**
 * Wraps any open sheet so the shell knows one is open.
 *
 * A sheet has to reach the chrome for two reasons — the tab bar under its
 * scrim must dim and go inert, and `main` must leave the accessibility tree so
 * a screen reader inside the sheet cannot wander into the page beneath it. The
 * sheet itself is a feature's component and has no business importing the
 * shell's context, so this is the seam.
 *
 * A HOST RATHER THAN A HOOK EACH FEATURE CALLS (SYS-1's dev call): a hook is
 * a line every future sheet must remember, and the one that forgets leaves a
 * tappable tab bar under a scrim. Rendering through the host is structural —
 * if the sheet is on screen, the host is mounted.
 *
 *   <SheetHost open={sheet.open}>
 *     <ResponsiveSheet open={sheet.open} onOpenChange={…}>…</ResponsiveSheet>
 *   </SheetHost>
 */
export function SheetHost({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const { setSheetOpen } = useShell();

  React.useEffect(() => {
    if (!open) return;
    setSheetOpen(true);
    return () => {
      setSheetOpen(false);
    };
  }, [open, setSheetOpen]);

  return <>{children}</>;
}
