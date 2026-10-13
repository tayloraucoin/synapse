"use client";

import * as React from "react";

import { Button, Caption, GroupHeading, StatusLine, Text } from "@syn/ui";
import { formatBytes } from "@syn/utils";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { DATA_COPY as COPY } from "./copy";

/**
 * ST-10's Export section.
 *
 * THE RESULT PERSISTS ACROSS VISITS. `user.exportStatus` reads the newest row
 * on load, so a person who asked for an export, closed the tab, and came back
 * finds their link rather than a button that looks like nothing happened. The
 * row is the state; this component only renders it.
 *
 * THE LINK IS NEVER IN THE PAGE. *Download* is a button, not an `<a href>`,
 * because the URL is minted when it is pressed — a signed URL to a person's
 * entire record must not sit in a server-rendered document, a scroll-back
 * buffer, or a browser cache. It opens in a new window because the file is
 * served by storage rather than by this app (cross-cutting §5.2).
 *
 * POLLING ONLY WHILE `preparing`. The build runs inside the mutation, so the
 * ordinary path never polls at all: the mutation returns the finished row. The
 * interval exists for the one case the ticket names — a reload while an earlier
 * request is still in flight — and stops the moment the row settles.
 */
export function ExportSection() {
  const online = useOnline();
  const utils = trpc.useUtils();
  const [error, setError] = React.useState<string | null>(null);

  const status = trpc.user.exportStatus.useQuery(undefined, {
    refetchInterval: (query) =>
      query.state.data?.status === "preparing" ? 3000 : false,
  });

  const request = trpc.user.requestExport.useMutation();
  const link = trpc.user.exportDownloadUrl.useMutation();

  const row = status.data ?? null;
  const preparing = row?.status === "preparing" || request.isPending;

  async function start(): Promise<void> {
    setError(null);
    try {
      await request.mutateAsync();
    } catch {
      // The mutation returns a `failed` row rather than throwing, so this is
      // the transport falling over — the same sentence either way.
      setError(COPY.failed);
    }
    await utils.user.exportStatus.invalidate();
  }

  async function download(id: string): Promise<void> {
    setError(null);
    /*
     * The window is opened BEFORE the await. A popup blocker allows a window
     * opened inside a click handler and blocks one opened from a promise
     * callback, so the tab is claimed synchronously and pointed at the URL
     * once it arrives. `noopener` is set on the handle for the same reason the
     * attribute exists: the opened page must not reach back into this one.
     */
    const opened = window.open("", "_blank", "noopener,noreferrer");
    try {
      const { url } = await link.mutateAsync({ id });
      if (url === null) {
        opened?.close();
        setError(COPY.expired);
        await utils.user.exportStatus.invalidate();
        return;
      }
      if (opened) opened.location.href = url;
      else window.location.href = url;
    } catch {
      opened?.close();
      setError(COPY.downloadFailed);
    }
  }

  const size = row?.byteSize === null || row?.byteSize === undefined
    ? null
    : formatBytes(row.byteSize);

  return (
    <section className="flex flex-col gap-(--space-2)">
      <GroupHeading>{COPY.exportHeading}</GroupHeading>

      <Text as="p" tone="secondary" className="max-w-(--measure)">
        {COPY.exportBody}
      </Text>

      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      <div className="pt-(--space-2)">
        <Button
          variant="secondary"
          busy={preparing}
          disabled={!online || preparing}
          onClick={() => void start()}
        >
          {row?.status === "expired" ? COPY.exportAgain : COPY.exportAction}
        </Button>
      </div>

      {/*
        One live region for every result, so a screen reader hears the state
        change once rather than hearing a region appear and another vanish.
      */}
      <div aria-live="polite" className="flex flex-col gap-(--space-1)">
        {error !== null ? (
          <Text as="p" tone="secondary">
            {error}
          </Text>
        ) : preparing ? (
          <Text as="p" tone="secondary">
            {COPY.preparing}
          </Text>
        ) : row?.status === "ready" && size !== null ? (
          <>
            <div className="flex flex-wrap items-center gap-(--space-3)">
              <Text as="p" tone="secondary">
                {COPY.ready(size)}
              </Text>
              <Button
                variant="ghost"
                aria-label={COPY.downloadLabel(size)}
                busy={link.isPending}
                disabled={!online}
                onClick={() => void download(row.id)}
              >
                {COPY.download}
              </Button>
            </div>
            <Caption as="p">{COPY.linkLifetime}</Caption>
          </>
        ) : row?.status === "expired" ? (
          <Text as="p" tone="secondary">
            {COPY.expired}
          </Text>
        ) : row?.status === "failed" ? (
          <Text as="p" tone="secondary">
            {COPY.failed}
          </Text>
        ) : null}
      </div>
    </section>
  );
}
