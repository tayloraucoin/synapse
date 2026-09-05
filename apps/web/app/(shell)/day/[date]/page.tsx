import { notFound, redirect } from "next/navigation";

import { Text } from "@syn/ui";
import { formatCalendarDay } from "@syn/utils";
import { dateKeySchema } from "@syn/validators";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { getServerApi } from "@/lib/trpc/server";
import { todayRoute } from "@/lib/routes";

/**
 * Placeholder — LS-01 Plain List, for a past or future day (cross-cutting §8.2:
 * record mode and plan mode).
 *
 * The segment is validated rather than trusted: a URL is untrusted input, and
 * `dateKeySchema` is the same schema the API uses, so a key that 404s here
 * cannot succeed against a procedure.
 *
 * TODAY REDIRECTS TO `/today`. One canonical URL per screen: without it a
 * person can be on "today" at two different paths, the tab bar has to know
 * about both, and back walks through a duplicate.
 */
export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  const status = await readStatus();
  if (status?.todayKey === date) redirect(todayRoute());

  return (
    <PageFrame
      dayKey={date}
      header={
        <ShellPageHeader
          title="LS-01 Plain List"
          dateContext={{
            // "Thursday, September 4" — the day is named, not computed by the
            // reader from a key.
            label: formatCalendarDay(
              new Date(`${date}T12:00:00Z`),
              "UTC",
              "long",
            ),
            todayHref: todayRoute(),
          }}
        />
      }
    >
      <Text as="p" tone="secondary">
        A past day renders in record mode; a future day in plan mode.
      </Text>
    </PageFrame>
  );
}

/** The chrome is never load-bearing — a failure just skips the redirect. */
async function readStatus() {
  try {
    const api = await getServerApi();
    return await api.shell.status();
  } catch {
    return null;
  }
}
