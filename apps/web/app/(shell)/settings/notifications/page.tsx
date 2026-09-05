import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — ST-07 Notifications. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsNotificationsPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"ST-07 Notifications"} showBack />}
    >
      <Text as="p" tone="secondary">
        One toggle per row of the catalogue.
      </Text>
    </PageFrame>
  );
}
