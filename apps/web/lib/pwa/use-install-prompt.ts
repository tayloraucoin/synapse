"use client";

import { useCallback, useEffect, useState } from "react";

import {
  canShowInstallPrompt,
  isAndroid,
  isIOS,
  isPWA,
} from "./install-detection";

export type DeferredInstallPrompt = {
  prompt: () => Promise<{ outcome: string }>;
};

/**
 * Shared PWA install prompt state.
 *
 * Cross-cutting §5.1: the install offer appears once, from Settings on iOS
 * (where push needs it) and from a one-line status message elsewhere after the
 * third reviewed day. This hook holds the state; the surfaces that use it are
 * `InstallSheet` and the install status line, both feature-track composites.
 *
 * It deliberately does not track dismissal — dismissal is the status line's
 * business (it never returns), and Settings stays the recovery path.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<DeferredInstallPrompt | null>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">(
    "other",
  );
  const [showModal, setShowModal] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (isPWA() || !canShowInstallPrompt()) {
      setCanInstall(false);
      return;
    }

    setCanInstall(true);
    if (isIOS()) {
      setPlatform("ios");
    } else if (isAndroid()) {
      setPlatform("android");
    } else {
      setPlatform("other");
    }
  }, []);

  useEffect(() => {
    if (!canInstall) {
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt({
        prompt: () =>
          (
            e as unknown as { prompt: () => Promise<{ outcome: string }> }
          ).prompt(),
      });
      setPlatform(isAndroid() ? "android" : "other");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, [canInstall]);

  useEffect(() => {
    function handleAppInstalled() {
      setCanInstall(false);
    }

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => window.removeEventListener("appinstalled", handleAppInstalled);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      const result = await deferredPrompt.prompt();
      if (result.outcome === "accepted") {
        setCanInstall(false);
      }
    } catch (error) {
      console.error("Install prompt failed:", error);
    }
  }, [deferredPrompt]);

  const openInstallModal = useCallback(() => {
    setShowModal(true);
  }, []);

  return {
    canInstall,
    deferredPrompt,
    platform,
    showModal,
    setShowModal,
    handleInstallClick,
    openInstallModal,
  };
}
