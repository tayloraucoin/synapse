import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — TP-01 Templates. 
 *
 * Replaced by the Epic 1 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsTemplatesPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"TP-01 Templates"} showBack />}
    >
      <Text as="p" tone="secondary">
        Named day plans.
      </Text>
    </PageFrame>
  );
}
