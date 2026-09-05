import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — CT-01 Categories. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsCategoriesPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"CT-01 Categories"} showBack />}
    >
      <Text as="p" tone="secondary">
        For time reporting only — never a mechanic.
      </Text>
    </PageFrame>
  );
}
