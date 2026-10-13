import { BoardSkeleton } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

import { WORKFLOW_COPY } from "../_components/copy";

/**
 * The board's own shape while it loads (UX §2 guardrail 8, WF-01 *Loading*):
 * the frame, the `h1`, the skeleton board. Never a blank, never a spinner.
 */
export default function WorkflowViewLoading() {
  return (
    <PageFrame header={<ShellPageHeader title={WORKFLOW_COPY.title} />} contentWidth="board">
      <BoardSkeleton />
    </PageFrame>
  );
}
