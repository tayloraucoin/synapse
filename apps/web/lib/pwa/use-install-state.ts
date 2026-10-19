"use client";

import * as React from "react";
import { isAndroid, isHandheld, isIOS, isPWA } from "./install-detection";
import {
  useDeferredInstallPrompt,
  type DeferredInstallPrompt,
} from "./use-installable";

/**
 * What the account surfaces need to know about installing (USE-83): the
 * avatar menu's "Install the app" row and the Install sheet's tab, line and
 * "Install".
 *
 * READ ON THE DEVICE, AFTER MOUNT. The server renders no guess: until the
 * effect runs `known` is false and nothing install-shaped shows, so the first
 * client frame matches the server's and the row arrives a beat late rather
 * than flashing and vanishing (C-USE-install-sheet-5).
 *
 * `appinstalled` ends the offer at once: `isPWA()` is not true until the next
 * load in the standalone window.
 */

/** The Install sheet's two tabs; a device that is neither opens on iPhone. */
export type InstallPlatform = "iphone" | "android";

export interface InstallFacts {
  /** Running from the home screen (`display-mode: standalone`, or iPhone's `navigator.standalone`). */
  standalone: boolean;
  /** A phone browser: iPhone, Android, or a touch screen at phone width. */
  phone: boolean;
  platform: InstallPlatform;
  /** On an iPhone, a browser other than Safari: "Open this page in Safari first." */
  notSafari: boolean;
}

export interface InstallState extends InstallFacts {
  /** False until read on the device; nothing install-shaped renders before. */
  known: boolean;
  /** Chrome's own install prompt, held ready (Android only), or null. */
  prompt: DeferredInstallPrompt | null;
}

/** A scenario's override, so a capture can stand on any device (`?state=`). */
export type InstallOverride = Partial<InstallFacts> & { prompt?: boolean };

/**
 * Browsers on iPhone that are not Safari, by their own UA tokens: Chrome,
 * Firefox, Edge, Opera, Yandex, DuckDuckGo, Google's app, and the in-app
 * browsers of Facebook, Instagram and Line.
 */
const IOS_OTHER_BROWSER =
  /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|DuckDuckGo|GSA\/|FBAN|FBAV|Instagram|Line\//;

export function isOtherIosBrowser(userAgent: string): boolean {
  return IOS_OTHER_BROWSER.test(userAgent);
}

/** The facts, from the browser in hand. Client only. */
export function readInstallFacts(): InstallFacts {
  const ios = isIOS();
  return {
    standalone: isPWA(),
    phone: ios || isAndroid() || isHandheld(),
    platform: isAndroid() ? "android" : "iphone",
    notSafari: ios && isOtherIosBrowser(navigator.userAgent),
  };
}

/**
 * Whether "Install the app" is offered: read, in a phone browser, not
 * installed, and below the desk (D-USE-88, D-USE-89). One expression, so the
 * menu and the sheet's guard cannot disagree.
 */
export function isInstallOffered(
  state: InstallState,
  atDesk: boolean,
): boolean {
  return state.known && !state.standalone && state.phone && !atDesk;
}

const UNKNOWN: InstallFacts = {
  standalone: false,
  phone: false,
  platform: "iphone",
  notSafari: false,
};

const FORCED_PROMPT: DeferredInstallPrompt = {
  prompt: () => Promise.resolve({ outcome: "dismissed" }),
};

export function useInstallState(override?: InstallOverride): InstallState {
  const [facts, setFacts] = React.useState<InstallFacts | null>(null);
  const prompt = useDeferredInstallPrompt();

  React.useEffect(() => {
    setFacts(readInstallFacts());

    function onInstalled(): void {
      setFacts((current) =>
        current === null ? current : { ...current, standalone: true },
      );
    }

    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const { prompt: forcePrompt, ...forced } = override ?? {};
  const known = facts !== null;
  return {
    ...(facts ?? UNKNOWN),
    ...(known ? forced : {}),
    known,
    prompt: !known
      ? null
      : forcePrompt === undefined
        ? prompt
        : forcePrompt
          ? FORCED_PROMPT
          : null,
  };
}
