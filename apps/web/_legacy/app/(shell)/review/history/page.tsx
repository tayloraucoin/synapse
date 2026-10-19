import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { getServerApi } from "@/lib/trpc/server";

import { HISTORY_COPY } from "./_components/copy";
import { HistoryList } from "./_components/history-list";

/**
 * HS-01 History.
 *
 * THE FIRST PAGE IS SERVER-RENDERED and later pages are fetched — the ticket's
 * ruling. Someone arriving here has come to look at something specific, so the
 * first eight weeks should be on the screen when it paints; *Show earlier
 * weeks* is a deliberate second ask and can afford a request.
 *
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default async function ReviewHistoryPage() {
  const api = await getServerApi();
  const initial = await api.review.history({});

  return (
    <PageFrame header={<ShellPageHeader title={HISTORY_COPY.title} showBack />}>
      <HistoryList initial={initial} />
    </PageFrame>
  );
}
