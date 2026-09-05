import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — LS-01 Plain List. 
 *
 * Replaced by the Epic 2 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function TodayPage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"LS-01 Plain List"} />}
    >
      <Text as="p" tone="secondary">
        Today, top to bottom, in time order.
      </Text>
    </PageFrame>
  );
}
