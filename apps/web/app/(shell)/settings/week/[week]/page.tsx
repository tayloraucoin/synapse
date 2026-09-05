import { notFound } from "next/navigation";

import { Text } from "@syn/ui";
import { weekKeySchema } from "@syn/validators";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/** Placeholder — WK-01 Week build, for a specific week. */
export default async function SettingsWeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;
  if (!weekKeySchema.safeParse(week).success) notFound();

  return (
    <PageFrame
      header={<ShellPageHeader title={<>WK-01 Week build — {week}</>} showBack />}
    >
      <Text as="p" tone="secondary">Seven days, one template each.</Text>
    </PageFrame>
  );
}
