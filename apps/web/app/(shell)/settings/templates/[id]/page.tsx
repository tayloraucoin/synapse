import { Heading, Text } from "@syn/ui";

/** Placeholder — TP-02 Template editor. */
export default async function SettingsTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Heading>TP-02 Template editor</Heading>
      <Text as="p" tone="secondary">{id}</Text>
    </>
  );
}
