import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — ST-06 Reasons. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsReasonsPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"ST-06 Reasons"} showBack />}
    >
      <Text as="p" tone="secondary">
        The reason set the Day Review offers.
      </Text>
    </PageFrame>
  );
}
