import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { REVIEW_COPY } from "@/components/review-day";

import { ReviewTab } from "./_components/review-tab";

/**
 * RV-00 Review.
 *
 * A tab rather than a pushed screen, so it has no back arrow — the shell's
 * avatar is its only header action, and every region is a door forward.
 */
export default function ReviewPage() {
  return (
    <PageFrame header={<ShellPageHeader title={REVIEW_COPY.title} />}>
      <ReviewTab />
    </PageFrame>
  );
}
