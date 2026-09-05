import { NextResponse } from "next/server";

import { webPushSubscriptions } from "@syn/db";
import { createLogger } from "@syn/observability";
import { webPushSubscribeInput } from "@syn/validators";

import { getRequestAuthContextFromRequest } from "@/lib/auth/get-request-context";

export const runtime = "nodejs";

const log = createLogger("web/pwa/subscribe");

/**
 * Register this browser for reminders.
 *
 * The upsert targets `endpoint`, which is the browser's own identifier for the
 * subscription: calling this twice from the same device updates one row rather
 * than accumulating them, and re-subscribing after a revoke clears
 * `revoked_at` instead of leaving a dead row shadowing a live one.
 *
 * Written through `auth.rls.execute` as the person, so the row is theirs by
 * policy and not merely by the `userId` we happened to set.
 */
export async function POST(request: Request) {
  try {
    const auth = await getRequestAuthContextFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = webPushSubscribeInput.parse(await request.json());

    await auth.rls.execute(async (tx) => {
      await tx
        .insert(webPushSubscriptions)
        .values({
          endpoint: body.endpoint,
          p256dh: body.keys.p256dh,
          auth: body.keys.auth,
          userId: auth.user.id,
          userAgent: body.userAgent ?? null,
          platform: body.platform,
          revokedAt: null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: webPushSubscriptions.endpoint,
          set: {
            p256dh: body.keys.p256dh,
            auth: body.keys.auth,
            userId: auth.user.id,
            userAgent: body.userAgent ?? null,
            platform: body.platform,
            revokedAt: null,
            updatedAt: new Date(),
          },
        });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // The endpoint is a credential-bearing URL — log the fault, never the body.
    log.log("subscribe failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
