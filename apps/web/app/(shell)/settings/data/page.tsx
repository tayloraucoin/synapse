import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — ST-10 Your data. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsDataPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"ST-10 Your data"} showBack />}
    >
      <Text as="p" tone="secondary">
        Export everything, or delete the account.
      </Text>
    </PageFrame>
  );
}
