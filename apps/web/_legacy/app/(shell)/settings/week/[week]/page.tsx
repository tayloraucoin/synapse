import { notFound } from "next/navigation";

import { weekKeySchema } from "@syn/validators";

import { PageFrame } from "@/components/page-frame";
import { WeekCanvas, WeekHeader } from "@/components/week-build";

/**
 * WK-01 Week build, for one named week.
 *
 * The key is validated with the same `weekKeySchema` the procedures use, so a
 * key that 404s here could not have succeeded against `week.get` either.
 */
export default async function SettingsWeekKeyPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  return (
    <PageFrame contentWidth="canvas" header={<WeekHeader weekKey={week} />}>
      <WeekCanvas weekKey={week} />
    </PageFrame>
  );
}
