import { notFound } from "next/navigation";

import { Heading, Text } from "@syn/ui";
import { dateKeySchema } from "@syn/validators";

/**
 * Placeholder — LS-01 Plain List, for a past or future day (cross-cutting §8.2:
 * record mode and plan mode).
 *
 * The segment is validated rather than trusted: a URL is untrusted input, and
 * `dateKeySchema` is the same schema the API uses, so a key that 404s here
 * cannot succeed against a procedure.
 */
export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  return (
    <>
      <Heading>LS-01 Plain List — {date}</Heading>
      <Text as="p" tone="secondary">
        A past day renders in record mode; a future day in plan mode.
      </Text>
    </>
  );
}
