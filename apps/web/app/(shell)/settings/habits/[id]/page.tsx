import { Heading, Text } from "@syn/ui";

/** Placeholder — LB-02 Habit sheet (create / edit). */
export default async function SettingsHabitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Heading>LB-02 Habit sheet</Heading>
      <Text as="p" tone="secondary">{id}</Text>
    </>
  );
}
