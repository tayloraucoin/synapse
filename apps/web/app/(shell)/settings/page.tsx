import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — ST-00 Settings. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"ST-00 Settings"} />}
    >
      <Text as="p" tone="secondary">
        The index.
      </Text>
    </PageFrame>
  );
}
