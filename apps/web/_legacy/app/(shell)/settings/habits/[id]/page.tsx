import { PageFrame } from "@/components/page-frame";

import { HabitDetail } from "./_components/habit-detail";
import { HabitDetailHeader } from "./_components/habit-detail-header";

/**
 * LB-03 Habit detail — a screen, not a sheet (Epic 1 LB-03).
 *
 * The route is the habit's, so arriving from LB-01 with `?sheet=habit` opens
 * the editor over the usage rather than instead of it.
 */
export default async function SettingsHabitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageFrame header={<HabitDetailHeader habitId={id} />}>
      <HabitDetail habitId={id} />
    </PageFrame>
  );
}
