"use client";

import { useEffect } from "react";

const SW_URL = "/sw.js";
const SCOPE = "/";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register(SW_URL, { scope: SCOPE, updateViaCache: "none" })
      .then((registration) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[PWA] Service worker registered", registration.scope);
        }
      })
      .catch((err) => {
        console.warn("[PWA] Service worker registration failed", err);
      });
  }, []);

  return null;
}
