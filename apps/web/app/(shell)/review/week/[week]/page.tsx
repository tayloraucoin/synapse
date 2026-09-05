import { notFound } from "next/navigation";

import { Heading, Text } from "@syn/ui";
import { weekKeySchema } from "@syn/validators";

/** Placeholder — WR-01 Week Review. */
export default async function ReviewWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  return (
    <>
      <Heading>WR-01 Week Review — {week}</Heading>
      <Text as="p" tone="secondary">
        Which habits slipped, where the time went, how the templates were used.
      </Text>
    </>
  );
}
