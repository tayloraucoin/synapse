"use client";

import { useEffect } from "react";

import { isPWA } from "@/lib/pwa/install-detection";

/** Cookie name must match server-side PWA_COOKIE_NAME (cannot import from server-only module). */
export const PWA_COOKIE_NAME = "syn_pwa_mode";

const COOKIE_MAX_AGE = 31536000; // 1 year in seconds

/**
 * Syncs standalone/PWA mode to a cookie so the server can branch on it.
 *
 * Nothing branches on it yet, and that is fine — it is here so the signal
 * exists the first time a server component needs to know (cross-cutting §5.2:
 * standalone has no browser chrome, so the header carries back). The one-time
 * reload on first detection is what makes that first server render correct
 * rather than a frame behind.
 */
export function PwaModeSync() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const inStandalone = isPWA();
    const cookieAlreadySet = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith(`${PWA_COOKIE_NAME}=1`));

    if (inStandalone) {
      document.cookie = `${PWA_COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      if (!cookieAlreadySet) {
        window.location.reload();
      }
    } else {
      document.cookie = `${PWA_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    }
  }, []);

  return null;
}
