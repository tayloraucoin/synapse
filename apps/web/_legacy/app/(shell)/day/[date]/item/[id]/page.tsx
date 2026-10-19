import { notFound, redirect } from "next/navigation";

import { dateKeySchema } from "@syn/validators";

import { getServerApi } from "@/lib/trpc/server";
import { dayRoute, todayRoute } from "@/lib/routes";

/**
 * IT-01, addressable because a notification deep-links to it (cross-cutting
 * §4.1).
 *
 * IT IS A REDIRECT, NOT A SCREEN. Every other sheet in the product is a query
 * param on the route beneath it, and this one has to land in the same state —
 * otherwise a notification opens a page that looks like the day but is not
 * one, and closing the sheet has nowhere to go. So the path is translated into
 * the ordinary form and the List opens the sheet.
 *
 * The date is validated first: a URL is untrusted, and `dateKeySchema` is the
 * same schema the API uses, so a key that 404s here cannot succeed against a
 * procedure. The id is not validated — the sheet closes itself on an id it
 * cannot find (USE-3), which is the honest answer for a link to something that
 * has since been deleted.
 */
export default async function DayItemPage({
  params,
}: {
  params: Promise<{ date: string; id: string }>;
}) {
  const { date, id } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  const base = (await isToday(date)) ? todayRoute() : dayRoute(date);
  redirect(`${base}?sheet=item&id=${encodeURIComponent(id)}`);
}

/**
 * Today's own day gets `/today`, not `/day/{today}` — one canonical URL per
 * screen, so the tab bar and the back stack agree about where a person is.
 */
async function isToday(date: string): Promise<boolean> {
  try {
    const api = await getServerApi();
    const status = await api.shell.status();
    return status?.todayKey === date;
  } catch {
    return false;
  }
}
