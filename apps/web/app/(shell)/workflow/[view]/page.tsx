import { PageFrame, ShellPageHeader } from "@/components/page-frame";

import { WORKFLOW_COPY } from "../_components/copy";

/**
 * One view's route (`workflowViewRoute(id)`) — WF-01's, here now so the
 * builder has a page behind it (FLO-5). The same empty frame as the root
 * route until FLO-6 renders the board here.
 */
export default function WorkflowViewPage() {
  return (
    <PageFrame header={<ShellPageHeader title={WORKFLOW_COPY.title} />} contentWidth="canvas">
      {null}
    </PageFrame>
  );
}
