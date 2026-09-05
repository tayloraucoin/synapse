import { notFound, redirect } from "next/navigation";

import { Text } from "@syn/ui";
import { formatCalendarDay } from "@syn/utils";
import { dateKeySchema } from "@syn/validators";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { getServerApi } from "@/lib/trpc/server";
import { todayScheduleRoute } from "@/lib/routes";

/**
 * Placeholder — SC-01 Schedule, for a past or future day.
 *
 * Today redirects to `/today/schedule`, for the same reason the List does: one
 * canonical URL per screen.
 */
export default async function DaySchedulePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  const status = await readStatus();
  if (status?.todayKey === date) redirect(todayScheduleRoute());

  return (
    <PageFrame
      dayKey={date}
      header={
        <ShellPageHeader
          title="SC-01 Schedule"
          dateContext={{
            label: formatCalendarDay(
              new Date(`${date}T12:00:00Z`),
              "UTC",
              "long",
            ),
            todayHref: todayScheduleRoute(),
          }}
        />
      }
    >
      <Text as="p" tone="secondary">
        No now line on a day that is not today.
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
