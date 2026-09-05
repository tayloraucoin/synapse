import { notFound } from "next/navigation";

import { Text } from "@syn/ui";
import { weekKeySchema } from "@syn/validators";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/** Placeholder — WR-01 Week Review. */
export default async function ReviewWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  return (
    <PageFrame
      header={<ShellPageHeader title={<>WR-01 Week Review — {week}</>} />}
    >
      <Text as="p" tone="secondary">
        Which habits slipped, where the time went, how the templates were used.
      </Text>
    </PageFrame>
  );
}
