import { notFound } from "next/navigation";

import { Heading, Text } from "@syn/ui";
import { weekKeySchema } from "@syn/validators";

/** Placeholder — WK-01 Week build, for a specific week. */
export default async function SettingsWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  return (
    <>
      <Heading>WK-01 Week build — {week}</Heading>
      <Text as="p" tone="secondary">Seven days, one template each.</Text>
    </>
  );
}
