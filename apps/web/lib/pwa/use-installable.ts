"use client";

import * as React from "react";

import {
  canShowInstallPrompt,
  isAndroid,
  isPWA,
} from "./install-detection";

export type DeferredInstallPrompt = {
  prompt: () => Promise<{ outcome: string }>;
};

/**
 * Can this browser install the app, and does it have a prompt to offer?
 *
 * WHY NOT `useInstallPrompt` (INF-9). That hook carries a modal's open state
 * and a click handler, which are the install SHEET's concerns; the status line
 * needs two facts and no UI state, and mounting a hook that owns a modal in
 * the chrome would put a second install surface on every screen. Both read the
 * same detection module, so there is one answer to "what platform is this".
 *
 * DETECTED AFTER MOUNT, so the server renders no line and the client's first
 * frame matches it. `false` until then is the right default: an install offer
 * that flashed and vanished would be worse than one that arrives a beat late.
 *
 * `appinstalled` TURNS IT OFF IMMEDIATELY. Someone who has just installed
 * should not still be looking at an offer to install, and `isPWA()` will not
 * be true until the next load in the standalone window.
 */
export function useInstallable(): boolean {
  const [installable, setInstallable] = React.useState(false);

  React.useEffect(() => {
    setInstallable(canShowInstallPrompt());

    function onInstalled(): void {
      setInstallable(false);
    }

    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  return installable;
}

/**
 * The captured `beforeinstallprompt`, or null.
 *
 * ANDROID CHROME FIRES IT AND EVERYTHING ELSE DOES NOT — which is exactly the
 * branch SY-07's *How* needs: where the browser has its own install dialog, use
 * it, and where it does not, show the steps. The event has to be caught the
 * moment it fires and it fires once, early, so this listens from mount rather
 * than at tap time.
 */
export function useDeferredInstallPrompt(): DeferredInstallPrompt | null {
  const [deferred, setDeferred] = React.useState<DeferredInstallPrompt | null>(
    null,
  );

  React.useEffect(() => {
    if (isPWA() || !isAndroid()) return;

    function onBeforeInstallPrompt(event: Event): void {
      // Preventing the default is what stops Chrome showing its own mini
      // infobar, so the offer appears when the product decides it should.
      event.preventDefault();
      setDeferred({
        prompt: () =>
          (event as unknown as DeferredInstallPrompt).prompt(),
      });
    }

    function onInstalled(): void {
      setDeferred(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return deferred;
}

/**
 * SY-07's eligibility, as one expression — cross-cutting §5.1 and SYS-5's
 * ruling.
 *
 * IT IS A FUNCTION SO IT CAN BE CHECKED. Four conditions decide whether a
 * person is asked for a slot on their home screen, and three of them are the
 * ticket's acceptance criteria (two reviewed days: no; standalone: no; first
 * run owed: no). Inline in the component they would be a claim; here they can
 * be run against a truth table.
 *
 * The fifth condition — dismissed forever — is deliberately absent: it belongs
 * to the status-line slot's own `useDismissed("install", "forever")`, which is
 * the app's ONE dismissal mechanism, and duplicating it here would be a second
 * place the offer could be silenced.
 */
export function isInstallOfferEligible(input: {
  /** `canShowInstallPrompt()` — false when already standalone. */
  installable: boolean;
  reviewedDayCount: number;
  setupIncomplete: boolean;
}): boolean {
  return (
    input.installable &&
    // Three days a person actually closed out — the evidence that this is a
    // thing they use, and the only honest basis for the ask.
    input.reviewedDayCount >= REVIEWED_DAYS_BEFORE_OFFER &&
    // Someone still being set up has not decided anything yet (AC 7).
    !input.setupIncomplete
  );
}

/** Cross-cutting §5.1 — "after the third day with a reviewed day". */
export const REVIEWED_DAYS_BEFORE_OFFER = 3;
