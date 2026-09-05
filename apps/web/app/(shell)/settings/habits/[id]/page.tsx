import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/** Placeholder — LB-02 Habit sheet (create / edit). */
export default async function SettingsHabitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageFrame
      header={<ShellPageHeader title={"LB-02 Habit sheet"} showBack />}
    >
      <Text as="p" tone="secondary">{id}</Text>
    </PageFrame>
  );
}
