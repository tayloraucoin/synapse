import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — ST-11 Share the app. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsSharePage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"ST-11 Share the app"} showBack />}
    >
      <Text as="p" tone="secondary">
        The invite link.
      </Text>
    </PageFrame>
  );
}
