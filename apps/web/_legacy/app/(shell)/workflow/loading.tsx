import { BoardSkeleton } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";

import { WORKFLOW_COPY } from "./_components/copy";

/** While the root route resolves to a view: the board's shape, never a blank. */
export default function WorkflowLoading() {
  return (
    <PageFrame header={<ShellPageHeader title={WORKFLOW_COPY.title} />} contentWidth="board">
      <BoardSkeleton />
    </PageFrame>
  );
}
