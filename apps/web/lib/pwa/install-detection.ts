/**
 * Client-side PWA install detection helpers.
 */

export function isPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || isIPadOS();
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

/** iPadOS reports a Macintosh UA; touch points are the only tell. */
export function isIPadOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
}

/** Touch-primary input — true for phones/tablets, false for a mouse. */
export function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Tailwind `md` — the phone/tablet line for form-factor decisions. */
const HANDHELD_MAX_WIDTH = 767;

/**
 * Phone-shaped: a mobile UA, or a touch-primary device at phone width.
 *
 * UA alone is not enough. It misses Android tablets in desktop-site mode and
 * any touch device with an unusual UA, and — the reason this bites in
 * development — Chrome DevTools only spoofs the UA when a *named device* is
 * chosen, not in Responsive mode, so resizing alone would keep serving the
 * desktop variant. Pointer plus width is the signal both real phones and
 * device emulation actually agree on.
 */
export function isHandheld(): boolean {
  if (isIOS() || isAndroid()) return true;
  if (typeof window === "undefined") return false;
  return isCoarsePointer() && window.innerWidth <= HANDHELD_MAX_WIDTH;
}

/** Tablet-shaped: installable like a phone, but wide enough to also host the QR. */
export function isTabletFormFactor(): boolean {
  if (isIPadOS()) return true;
  if (typeof window === "undefined") return false;
  return isCoarsePointer() && window.innerWidth > HANDHELD_MAX_WIDTH;
}

export function canShowInstallPrompt(): boolean {
  if (typeof window === "undefined") return false;
  if (isPWA()) return false;
  return isIOS() || isAndroid() || "BeforeInstallPromptEvent" in window;
}
