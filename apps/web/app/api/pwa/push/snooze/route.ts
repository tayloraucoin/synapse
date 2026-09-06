import { NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";
import { snoozeDelivery } from "@syn/api";
import { days } from "@syn/db";
import { createLogger } from "@syn/observability";
import { snoozeInput } from "@syn/validators";

import { getRequestAuthContextFromRequest } from "@/lib/auth/get-request-context";

export const runtime = "nodejs";

const log = createLogger("web/pwa/snooze");

/**
 * N4's *Later* — defer the review reminder by an hour, once.
 *
 * IT IS A ROUTE HANDLER RATHER THAN A PROCEDURE because the caller is the
 * service worker, which has no tRPC client and no React. It is a browser-shaped
 * call from the app's own origin, which is one of the enumerated exceptions in
 * the conventions.
 *
 * THE SESSION AUTHENTICATES IT. The worker sends `credentials: "include"` on a
 * same-origin request, so the cookie is there and this reads exactly like any
 * other signed-in call. Nothing is trusted from the push payload.
 *
 * ONCE ONLY. A second *Later* on the same day is a person asking to be left
 * alone, and the answer to that is silence rather than a third reminder.
 * `snoozeDelivery` refuses it, and this reports success either way — the
 * outcome the person asked for is "stop", and they got it.
 */
export async function POST(request: Request) {
  try {
    const auth = await getRequestAuthContextFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = snoozeInput.parse(await request.json());

    // The day's own row is the target; the payload's date is only a lookup
    // key, and a date for somebody else's day finds nothing under RLS.
    const rows = await auth.rls.execute((tx) =>
      tx
        .select({ id: days.id })
        .from(days)
        .where(and(eq(days.userId, auth.user.id), eq(days.date, body.date)))
        .limit(1),
    );

    const day = rows[0];
    if (!day) return NextResponse.json({ snoozed: false });

    const result = await snoozeDelivery(
      auth.rls,
      auth.user.id,
      { kind: "review_reminder", targetId: day.id },
      new Date(),
    );

    return NextResponse.json(result);
  } catch (error) {
    log.log("snooze failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Failed to snooze" }, { status: 500 });
  }
}
