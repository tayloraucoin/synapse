import { and, eq, isNull } from "drizzle-orm";

import { buildServiceRoleAuthContext } from "@syn/auth";
import { createRlsClient, webPushSubscriptions } from "@syn/db";
import { createLogger } from "@syn/observability";

import {
  sendWebPush,
  WebPushGoneError,
  type WebPushPayload,
} from "./web-push";

const log = createLogger("notifications/fan-out");

/**
 * Send one notification to every live subscription a person has.
 *
 * WHY A SERVICE-ROLE CONTEXT. The scheduler has no session — it is a cron
 * request, not a person — so there is no `app.user_id` to scope by. It builds
 * an explicit service-role context for the target user rather than reaching
 * for the singleton `db`, which keeps the bypass named, narrow, and greppable:
 * every RLS bypass in this codebase is a `buildServiceRoleAuthContext` call
 * you can find.
 *
 * PAYLOADS ARE CONTENT-FREE beyond what official spec §8.2 names. See
 * `web-push.ts`.
 *
 * A subscription the push service reports as gone (404/410) is revoked rather
 * than retried forever. Every other failure is logged and the remaining
 * devices still get their notification — one dead phone must not silence the
 * laptop.
 */
export type FanOutResult = {
  sent: number;
  revoked: number;
  failed: number;
};

export async function sendToUser(
  userId: string,
  payload: WebPushPayload,
  options?: { ttlSeconds?: number },
): Promise<FanOutResult> {
  const rls = createRlsClient(buildServiceRoleAuthContext(userId));

  const subscriptions = await rls.execute((tx) =>
    tx
      .select({
        id: webPushSubscriptions.id,
        endpoint: webPushSubscriptions.endpoint,
        p256dh: webPushSubscriptions.p256dh,
        auth: webPushSubscriptions.auth,
      })
      .from(webPushSubscriptions)
      .where(
        and(
          eq(webPushSubscriptions.userId, userId),
          isNull(webPushSubscriptions.revokedAt),
        ),
      ),
  );

  if (subscriptions.length === 0) {
    return { sent: 0, revoked: 0, failed: 0 };
  }

  // All devices in parallel: one slow push service must not delay the others,
  // and one failure must not abandon the rest.
  const outcomes = await Promise.allSettled(
    subscriptions.map((subscription) =>
      sendWebPush(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
        options,
      ),
    ),
  );

  const gone: string[] = [];
  let sent = 0;
  let failed = 0;

  outcomes.forEach((outcome, index) => {
    const subscription = subscriptions[index];
    if (!subscription) return;

    if (outcome.status === "fulfilled") {
      sent += 1;
      return;
    }
    if (outcome.reason instanceof WebPushGoneError) {
      gone.push(subscription.id);
      return;
    }
    failed += 1;
    log.log("send failed", {
      subscriptionId: subscription.id,
      message:
        outcome.reason instanceof Error
          ? outcome.reason.message
          : String(outcome.reason),
    });
  });

  for (const id of gone) {
    await rls.execute((tx) =>
      tx
        .update(webPushSubscriptions)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(webPushSubscriptions.id, id)),
    );
  }

  return { sent, revoked: gone.length, failed };
}
