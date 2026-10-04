"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { ShortcutsDialog } from "@syn/ui";

import { useGlobalShortcuts } from "@/lib/hooks/use-global-shortcuts";
import { SHORTCUTS } from "@/lib/keyboard/shortcuts";
import { dayRoute, todayRoute, workflowViewIdOf, workflowViewRoute } from "@/lib/routes";

/**
 * The one keyboard listener in the app, and the `?` dialog it opens — SYS-4.
 *
 * MOUNTED ONCE, IN THE SHELL. A per-screen listener would be several listeners
 * racing for the same keypress, and whichever mounted last would win — which is
 * a rule nobody wrote down. One handler, one place, and the pathname decides
 * which keys mean anything.
 *
 * `n` NAVIGATES RATHER THAN OPENING. The one-off sheet needs a day, which lives
 * in the page; the same `?sheet=` mechanism USE-6's late offer uses gets the
 * key from the chrome to the surface that can act on it, without the chrome
 * holding a day it has no other use for.
 *
 * THE DIALOG LISTS `SHORTCUTS`, the same array SYS-3's About table renders and
 * this file's handler dispatches from. One list: a key that works is a key
 * that is listed, and the reverse.
 */
export function ShortcutsHost() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  useGlobalShortcuts({
    onShowShortcuts: () => setOpen(true),
    onAddOneOff: () => {
      const base = pathname.startsWith("/day/")
        ? dayRoute(pathname.split("/")[2] ?? "")
        : todayRoute();
      router.push(`${base}?sheet=one-off`);
    },
    // FLO-7: *New task* crosses to the board as URL state it reads and clears.
    // Replace, not push, so back does not land on a page that reopens it.
    onNewWorkflowTask: () => {
      const viewId = workflowViewIdOf(pathname);
      if (viewId !== null) router.replace(workflowViewRoute(viewId, { add: true }));
    },
  });

  return (
    <ShortcutsDialog
      open={open}
      onOpenChange={setOpen}
      shortcuts={SHORTCUTS}
    />
  );
}
