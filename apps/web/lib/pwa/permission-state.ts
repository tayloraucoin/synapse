"use client";

import * as React from "react";

import type { PermissionState } from "@syn/types";

import { isIOS, isPWA } from "./install-detection";
import { isPushSupported, isVapidConfigured } from "./push-subscribe";

/**
 * Which of the five permission states this device is in — official spec §8.3.
 *
 * IT IS COMPUTED ON THE DEVICE AND NEVER STORED. Permission belongs to a
 * browser on a phone, not to an account: the same person can have reminders on
 * in their home-screen app and untouched in Safari, and a stored answer would
 * be wrong on one of them. The only server fact about the ask is
 * `reminder_prompt_answered_at`, which records that the question was PUT — not
 * what the OS said about it.
 *
 * THE ORDER OF THE CHECKS IS THE RULE. iOS outside a home screen cannot
 * receive push at all, so `not-installed` is decided before anything is asked
 * about `Notification.permission` — telling someone on iOS Safari that
 * reminders "aren't turned on yet" would send them looking for a switch that
 * cannot exist there.
 *
 * A MISSING VAPID KEY READS AS `unsupported`. It is a deployment fact, not a
 * choice the person made, and the honest thing is the line that offers
 * nothing rather than a button that would fail.
 */
export function readPermissionState(): PermissionState {
  if (typeof window === "undefined") return "unsupported";

  // iOS delivers push only to an installed app. Ask this first.
  if (isIOS() && !isPWA()) return "not-installed";

  if (!isPushSupported() || !isVapidConfigured()) return "unsupported";

  switch (Notification.permission) {
    case "granted":
      return "granted";
    case "denied":
      return "denied";
    default:
      return "not-asked";
  }
}

/**
 * The same value as React state, resolved after mount, with a way to re-read
 * it once the OS has answered.
 *
 * IT STARTS `unsupported` because the server has no `Notification` and no user
 * agent: rendering the real answer during SSR would either mismatch on
 * hydration or force every page that shows it to be client-only. Starting at
 * the state that offers nothing means the first paint never promises something
 * the device cannot do.
 *
 * `refresh` exists because `Notification.permission` changes underneath the
 * page — the OS prompt is not a React event — so after `subscribeToPush`
 * resolves, the caller re-reads rather than guessing from the result.
 */
export function usePermissionState(): {
  state: PermissionState;
  refresh: () => void;
} {
  const [state, setState] = React.useState<PermissionState>("unsupported");

  const refresh = React.useCallback(() => {
    setState(readPermissionState());
  }, []);

  React.useEffect(refresh, [refresh]);

  return { state, refresh };
}
