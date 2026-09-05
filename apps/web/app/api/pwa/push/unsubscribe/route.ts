import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { webPushSubscriptions } from "@syn/db";
import { createLogger } from "@syn/observability";

import { getRequestAuthContextFromRequest } from "@/lib/auth/get-request-context";

export const runtime = "nodejs";

const log = createLogger("web/pwa/unsubscribe");

const unsubscribeBodySchema = z.object({
  endpoint: z.string().url(),
});

/**
 * Stop reminders on this browser.
 *
 * A soft revoke (`revoked_at`), not a delete: the fan-out reaps endpoints the
 * push service rejects, and a row that has vanished cannot record that it was
 * the person who turned it off rather than the service that dropped it.
 *
 * RLS scopes the update to the caller's own subscriptions, so an endpoint
 * belonging to someone else matches zero rows rather than being revoked.
 */
export async function POST(request: Request) {
  try {
    const auth = await getRequestAuthContextFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = unsubscribeBodySchema.parse(await request.json());

    await auth.rls.execute(async (tx) => {
      await tx
        .update(webPushSubscriptions)
        .set({ revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(webPushSubscriptions.endpoint, body.endpoint));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.log("unsubscribe failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
}
