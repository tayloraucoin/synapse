import { notFound } from "next/navigation";

import { Text } from "@syn/ui";
import { dateKeySchema } from "@syn/validators";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/** Placeholder — DR-01 Day Review. */
export default async function ReviewDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!dateKeySchema.safeParse(date).success) notFound();

  return (
    <PageFrame
      header={<ShellPageHeader title={<>DR-01 Day Review — {date}</>} />}
    >
      <Text as="p" tone="secondary">
        Close the day honestly, once. Three taps per item, maximum.
      </Text>
    </PageFrame>
  );
}
