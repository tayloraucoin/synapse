import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — ST-01 Account. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsAccountPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"ST-01 Account"} showBack />}
    >
      <Text as="p" tone="secondary">
        Name, email, avatar, sign out.
      </Text>
    </PageFrame>
  );
}
