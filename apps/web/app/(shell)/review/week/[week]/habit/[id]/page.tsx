import { notFound } from "next/navigation";

import { Heading, Text } from "@syn/ui";
import { weekKeySchema } from "@syn/validators";

/** Placeholder — WR-02 Habit strip detail. */
export default async function ReviewWeekHabitPage({
  params,
}: {
  params: Promise<{ week: string; id: string }>;
}) {
  const { week, id } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  return (
    <>
      <Heading>WR-02 Habit strip detail</Heading>
      <Text as="p" tone="secondary">
        {week} · {id}
      </Text>
    </>
  );
}
