import { redirect } from "next/navigation";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { workflowRoute } from "@/lib/routes";
import { getServerApi } from "@/lib/trpc/server";

import { WORKFLOW_COPY } from "../_components/copy";
import { WorkflowBoard } from "./_components/workflow-board";

/**
 * WF-01 — one view's board (Workflow UX v0.1 §4; FLO-6).
 *
 * THE BOARD IS READ ON THE SERVER and handed to the client as initial data,
 * with the view tabs, so the first paint is the real board. An unknown or
 * archived view — or one that is not the person's — goes back to the root
 * route, which resolves to a real view (assessment §5: never a 404 out of
 * one's own board). The width is `board`: no cap beside the rail.
 */
export default async function WorkflowViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  const api = await getServerApi();

  const board = await api.workflow.board({ viewId: view }).catch(() => null);
  if (board === null) redirect(workflowRoute());
  const views = await api.workflow.view.list();

  return (
    <PageFrame header={<ShellPageHeader title={WORKFLOW_COPY.title} />} contentWidth="board">
      <WorkflowBoard viewId={board.view.id} initialBoard={board} initialViews={views} />
    </PageFrame>
  );
}
