"use client";

import * as React from "react";

import { Button, Text, TrustLine } from "@syn/ui";

import { COPIED_MS, SETTINGS_COPY as COPY } from "../../_components/copy";

/**
 * ST-11 — one link, one action, nothing else.
 *
 * NO TOKEN AND NO COUNTER. The link is the public sign-up address; there is
 * nothing to attribute and nobody to rank. A referral code here would turn a
 * sentence about privacy into a growth mechanic on the same screen.
 *
 * `navigator.share` IS FEATURE-DETECTED AFTER MOUNT, not during render. The
 * server has no navigator, so deciding on the first render would either mark
 * every page as client-only or produce a hydration mismatch; starting on the
 * copy fallback and upgrading is the honest order, and the fallback always
 * works.
 *
 * A CANCELLED SHARE IS NOT AN ERROR. `navigator.share` rejects when someone
 * dismisses the sheet, which is them deciding not to share — nothing is shown.
 */
export function SharePanel({ url }: { url: string }) {
  const [canShare, setCanShare] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function onShare(): Promise<void> {
    try {
      await navigator.share({ title: "Synapse", url });
    } catch {
      // Dismissed, or the platform refused. Neither is worth a sentence.
    }
  }

  async function onCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard permission denied. The link is on screen and selectable,
      // which is why it is rendered as text rather than only as a button.
    }
  }

  return (
    <div className="flex flex-col gap-(--space-5)">
      <Text as="p" tone="secondary">
        {COPY.shareBody}
      </Text>

      <Text as="p" variant="body" className="break-all select-all">
        {url}
      </Text>

      <div className="flex items-center gap-(--space-3)">
        {canShare ? (
          <Button onClick={() => void onShare()}>{COPY.share}</Button>
        ) : (
          <Button onClick={() => void onCopy()}>{COPY.copyLink}</Button>
        )}
        <Text as="span" variant="caption" tone="secondary" aria-live="polite">
          {copied ? COPY.copied : ""}
        </Text>
      </div>

      <TrustLine />
    </div>
  );
}
