import { redirect } from "next/navigation";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { workflowViewRoute } from "@/lib/routes";
import { getServerApi } from "@/lib/trpc/server";

import { WORKFLOW_COPY } from "./_components/copy";

/**
 * Workflow's root route — the fourth peer (Workflow UX v0.1 W1, §5; TD-44).
 *
 * IT NEVER RENDERS A BOARD: it resolves to the view opened last, else the
 * first. Reading the view list is also what makes a person's two starter
 * views on their first visit (TD-41). It does not wait behind the orient
 * frame (W16) — that exemption is `resolveEntry`'s.
 */
export default async function WorkflowPage() {
  const api = await getServerApi();
  const views = await api.workflow.view.list();
  const target = views.lastOpenedId ?? views.tabs[0]?.id;
  if (target !== undefined) redirect(workflowViewRoute(target));

  // Unreachable once the starter views exist; an honest frame if it ever is.
  return (
    <PageFrame header={<ShellPageHeader title={WORKFLOW_COPY.title} />} contentWidth="board">
      {null}
    </PageFrame>
  );
}
