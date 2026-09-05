import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/** Placeholder — TP-02 Template editor. */
export default async function SettingsTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageFrame
      header={<ShellPageHeader title={"TP-02 Template editor"} showBack />}
    >
      <Text as="p" tone="secondary">{id}</Text>
    </PageFrame>
  );
}
