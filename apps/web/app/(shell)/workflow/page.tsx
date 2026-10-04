import { PageFrame, ShellPageHeader } from "@/components/page-frame";

import { WORKFLOW_COPY } from "./_components/copy";

/**
 * Workflow's root route (`workflowRoute()`) — the fourth peer (Workflow UX
 * spec v0.1 W1, §5; FLO-5).
 *
 * FOR NOW, AN HONEST EMPTY FRAME: the heading and nothing beneath it. FLO-6
 * turns this into the resolver that redirects to the last view opened, and
 * the board fills `[view]`. It does not wait behind the orient frame (W16) —
 * that exemption is `resolveEntry`'s, not this page's.
 */
export default function WorkflowPage() {
  return (
    <PageFrame header={<ShellPageHeader title={WORKFLOW_COPY.title} />} contentWidth="canvas">
      {null}
    </PageFrame>
  );
}
