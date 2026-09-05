import { notFound } from "next/navigation";

import { Heading, Text } from "@syn/ui";
import { dateKeySchema } from "@syn/validators";

/** Placeholder — DR-01 Day Review. */
export default async function ReviewDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  return (
    <>
      <Heading>DR-01 Day Review — {date}</Heading>
      <Text as="p" tone="secondary">
        Close the day honestly, once. Three taps per item, maximum.
      </Text>
    </>
  );
}
