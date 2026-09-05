import { notFound } from "next/navigation";

import { Text } from "@syn/ui";
import { weekKeySchema } from "@syn/validators";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/** Placeholder — WR-02 Habit strip detail. */
export default async function ReviewWeekHabitPage({
  params,
}: {
  params: Promise<{ week: string; id: string }>;
}) {
  const { week, id } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  return (
    <PageFrame
      header={<ShellPageHeader title={"WR-02 Habit strip detail"} />}
    >
      <Text as="p" tone="secondary">
        {week} · {id}
      </Text>
    </PageFrame>
  );
}
