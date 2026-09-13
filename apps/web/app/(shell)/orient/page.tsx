import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ORIENT_COPY, OrientFrame } from "@/components/orient-frame";
import { getServerApi } from "@/lib/trpc/server";
import { todayRoute } from "@/lib/routes";

export const metadata: Metadata = { title: ORIENT_COPY.lastNight };

/**
 * `/orient` — the first screen of the morning (UX v1.1 §5.1, §5.2; DYN-13).
 *
 * THE READ IS THE STAMP. `day.orient` writes `woke_at = now` (source orient)
 * once, on the server, before the frame paints — so the wake is the moment
 * the frame was opened, not the moment a button was tapped. A day already
 * awake or already closed lands on Today: the frame is never shown twice for
 * one day, and never for a day that is over.
 *
 * The page renders no `PageFrame`: no header, no status line, no tab bar
 * (`AppShell` is bare on this path). The frame renders `main` itself.
 */
export default async function OrientPage() {
  const api = await getServerApi();
  const today = await api.day.today();
  if (today.closedAt !== null || today.wokeAt !== null) {
    redirect(todayRoute());
  }
  const view = await api.day.orient();

  return <OrientFrame initial={view} />;
}
