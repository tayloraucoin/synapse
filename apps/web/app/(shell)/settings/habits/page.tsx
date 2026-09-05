import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — LB-01 Habit library. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsHabitsPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"LB-01 Habit library"} showBack />}
    >
      <Text as="p" tone="secondary">
        Every habit, task, appointment, and deep-work block.
      </Text>
    </PageFrame>
  );
}
