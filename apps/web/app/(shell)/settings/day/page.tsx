import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — ST-08 Day & time. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsDayPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"ST-08 Day & time"} showBack />}
    >
      <Text as="p" tone="secondary">
        Time zone, day close time, review reminder.
      </Text>
    </PageFrame>
  );
}
