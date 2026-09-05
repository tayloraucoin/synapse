/**
 * Server-side Web Push configuration and the single-subscription send.
 *
 * VAPID keys: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
 * `VAPID_SUBJECT`. Generate a pair with `npx web-push generate-vapid-keys`.
 *
 * `web-push` is imported here and nowhere else in the repository — the
 * boundaries lint owns the module to this package.
 */

import webpush from "web-push";

import { VAPID_MAILTO_SUBJECT } from "@syn/constants";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || VAPID_MAILTO_SUBJECT;

let configured = false;

function ensureConfigured() {
  if (configured) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error(
      "Missing VAPID keys. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.",
    );
  }
  if (!VAPID_SUBJECT) {
    throw new Error(
      "Missing VAPID subject. Set VAPID_SUBJECT, or CONTACT_EMAIL in @syn/constants.",
    );
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
}

/**
 * What a notification may carry.
 *
 * `title` and `body` are the item's own title and time — the person's words on
 * the person's device — plus, for N1 only, their own preflight note, which
 * official spec §8.2 names explicitly. Nothing else from the day goes in a
 * payload: a push traverses a third-party service, and a reflection or a miss
 * reason is not something to hand one.
 *
 * `url` comes from a route builder in `apps/web/lib/routes.ts`, never a
 * hand-written path.
 */
export interface WebPushPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  url?: string;
}

export interface WebPushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * The push service rejected this subscription permanently — the browser was
 * uninstalled, the person cleared site data, the endpoint expired. 404 and 410
 * are the two codes that mean "never retry"; anything else may be transient.
 */
export class WebPushGoneError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number) {
    super(`Push subscription is gone (${statusCode}).`);
    this.name = "WebPushGoneError";
    this.statusCode = statusCode;
  }
}

/**
 * Send to one subscription.
 *
 * TTL is one day by default, which is a ceiling rather than a target: a
 * reminder for a 7:00 item that surfaces at 21:00 is noise, so each job sets
 * its own tighter TTL. The default exists so a job that forgets does not
 * default to *forever*.
 */
export async function sendWebPush(
  subscription: WebPushSubscriptionData,
  payload: WebPushPayload,
  options?: { ttlSeconds?: number },
): Promise<void> {
  ensureConfigured();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload),
      { TTL: options?.ttlSeconds ?? 86_400 },
    );
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      throw new WebPushGoneError(statusCode);
    }
    throw error;
  }
}

export function isVapidConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT);
}
