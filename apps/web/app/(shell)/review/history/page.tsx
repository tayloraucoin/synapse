import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — HS-01 History. 
 *
 * Replaced by the Epic 3 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function ReviewHistoryPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"HS-01 History"} />}
    >
      <Text as="p" tone="secondary">
        Past weeks and days.
      </Text>
    </PageFrame>
  );
}
