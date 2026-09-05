import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — RV-00 Review. 
 *
 * Replaced by the Epic 3 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function ReviewPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"RV-00 Review"} />}
    >
      <Text as="p" tone="secondary">
        Today, this week, history.
      </Text>
    </PageFrame>
  );
}
