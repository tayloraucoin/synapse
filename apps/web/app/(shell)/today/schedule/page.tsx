import { Text } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

/**
 * Placeholder — SC-01 Schedule. 
 *
 * Replaced by the Epic 2 track.
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function TodaySchedulePage() {
  return (
    <PageFrame
      header={<ShellPageHeader title={"SC-01 Schedule"} />}
    >
      <Text as="p" tone="secondary">
        The day against the plan.
      </Text>
    </PageFrame>
  );
}
