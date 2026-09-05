/**
 * Shared push-subscription helper.
 *
 * Encapsulates:
 *   1. Requesting browser notification permission
 *   2. Creating a PushManager subscription with the VAPID key
 *   3. POSTing the subscription to /api/pwa/push/subscribe
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export type PushSubscribeResult =
  | "subscribed"
  | "denied"
  | "unsupported"
  | "error";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function detectPlatform(): "ios" | "android" | "web" {
  if (typeof navigator === "undefined") return "web";
  if (/Android/i.test(navigator.userAgent)) return "android";
  if (/iPad|iPhone|iPod/i.test(navigator.userAgent)) return "ios";
  return "web";
}

/** Returns true when the current environment supports push notifications. */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/** Returns true when the public VAPID key is present in the client bundle. */
export function isVapidConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY);
}

/**
 * Request notification permission, create a push subscription,
 * and register it server-side.
 */
export async function subscribeToPush(): Promise<PushSubscribeResult> {
  if (!isPushSupported()) return "unsupported";

  if (!VAPID_PUBLIC_KEY) {
    console.error("[subscribeToPush] Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY");
    return "error";
  }

  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch {
    return "error";
  }

  if (permission === "denied") {
    return "denied";
  }

  if (permission !== "granted") {
    return "denied";
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const keyBytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: new Uint8Array(keyBytes) as BufferSource,
    });

    const p256dh = sub.getKey("p256dh");
    const auth = sub.getKey("auth");
    if (!p256dh || !auth) throw new Error("Missing subscription keys");

    const payload = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: arrayBufferToBase64Url(p256dh),
        auth: arrayBufferToBase64Url(auth),
      },
      userAgent: navigator.userAgent,
      platform: detectPlatform(),
    };

    const res = await fetch("/api/pwa/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string })?.error || res.statusText);
    }

    return "subscribed";
  } catch (e) {
    console.error("[subscribeToPush]", e);
    return "error";
  }
}
