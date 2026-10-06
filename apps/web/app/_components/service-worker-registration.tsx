"use client";

import { useEffect } from "react";

import { publishUpdateReady } from "@/lib/pwa/update-ready";

const SW_URL = "/sw.js";
const SCOPE = "/";

/**
 * Registers the push worker, and watches for a newer one (SY-02).
 *
 * A WAITING WORKER IS NOT THE FIRST INSTALL. `installed` fires for both, and
 * the tell is `navigator.serviceWorker.controller`: present means this page is
 * already controlled by an older worker, so the one that just installed is an
 * update sitting behind it. Without that check, every first visit would be
 * told a new version was ready.
 *
 * THE CHECK IS RE-RUN WHEN THE TAB COMES BACK. A tab left open for a day never
 * fires `updatefound` on its own, so a deploy would go unnoticed until the
 * person reloaded — which is the thing the line exists to save them from.
 * `updateViaCache: "none"` is what makes that check actually hit the network.
 *
 * NOTHING RELOADS HERE. The line is raised; the tap does the rest
 * (`reloadForUpdate`). Never a reload without one — that is the ticket's
 * non-negotiable, and it is why this file only ever publishes a flag.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cleanup: (() => void) | undefined;

    navigator.serviceWorker
      .register(SW_URL, { scope: SCOPE, updateViaCache: "none" })
      .then((registration) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[PWA] Service worker registered", registration.scope);
        }

        // Already waiting when this page loaded — a deploy that landed while
        // the tab was closed.
        if (registration.waiting && navigator.serviceWorker.controller) {
          publishUpdateReady(registration.waiting);
        }

        function onUpdateFound(): void {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              publishUpdateReady(installing);
            }
          });
        }

        function onVisible(): void {
          if (document.visibilityState !== "visible") return;
          void registration.update().catch(() => undefined);
        }

        registration.addEventListener("updatefound", onUpdateFound);
        document.addEventListener("visibilitychange", onVisible);

        cleanup = () => {
          registration.removeEventListener("updatefound", onUpdateFound);
          document.removeEventListener("visibilitychange", onVisible);
        };
      })
      .catch((err) => {
        console.warn("[PWA] Service worker registration failed", err);
      });

    return () => cleanup?.();
  }, []);

  return null;
}
