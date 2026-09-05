import { notFound } from "next/navigation";

import { Heading, Text } from "@syn/ui";
import { dateKeySchema } from "@syn/validators";

/**
 * Placeholder — IT-01 Item sheet.
 *
 * Addressable because a notification deep-links to it (cross-cutting §4.1);
 * every other sheet is a history state without a path.
 */
export default async function DayItemPage({
  params,
}: {
  params: Promise<{ date: string; id: string }>;
}) {
  const { date, id } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  return (
    <>
      <Heading>IT-01 Item sheet</Heading>
      <Text as="p" tone="secondary">
        {date} · {id}
      </Text>
    </>
  );
}
