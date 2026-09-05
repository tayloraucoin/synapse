import { notFound } from "next/navigation";

import { Heading, Text } from "@syn/ui";
import { dateKeySchema } from "@syn/validators";

/** Placeholder — SC-01 Schedule, for a past or future day. */
export default async function DaySchedulePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  return (
    <>
      <Heading>SC-01 Schedule — {date}</Heading>
      <Text as="p" tone="secondary">
        No now line on a day that is not today.
      </Text>
    </>
  );
}
