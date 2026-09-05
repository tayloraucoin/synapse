import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — WK-01 Week build. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsWeekPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"WK-01 Week build"} showBack />}
    >
      <Text as="p" tone="secondary">
        This week, day by day.
      </Text>
    </PageFrame>
  );
}
