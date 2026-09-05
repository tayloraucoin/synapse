/**
 * useLeaveGuard — a dirty form is never silently lost (v2 handoff §6.1, reuse CC).
 *
 * CC's hook, unchanged in substance. While `active`, a hard unload gets the
 * native prompt and in-app anchor navigation is intercepted: the clicked href
 * lands in `pendingHref` for `DiscardDialog` to resolve.
 *
 * WHY CAPTURE-PHASE ON `document`. The click has to be caught before Next's
 * router sees it, or the navigation has already started by the time this runs.
 * That is also why it only intercepts same-origin `/` hrefs — an external link
 * or a download is not a navigation this guard has any business cancelling.
 *
 * The guard covers anchors. `router.push` from a button bypasses it by
 * construction, so a canvas with programmatic navigation checks `dirty`
 * itself before calling push.
 */
"use client";

import { useEffect, useState } from "react";

export function useLeaveGuard(active: boolean) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (anchor === null || anchor.target === "_blank" || anchor.download)
        return;

      const href = anchor.getAttribute("href");
      if (href === null || !href.startsWith("/")) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(href);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [active]);

  return { pendingHref, setPendingHref };
}
