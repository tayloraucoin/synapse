"use client";

import * as React from "react";
import { Button, Text } from "@syn/ui";
import { usePermissionState } from "@/lib/pwa/permission-state";
import {
  subscribeToPush,
  type PushSubscribeResult,
} from "@/lib/pwa/push-subscribe";
import { TODAY_COPY } from "./copy";

const COPY = TODAY_COPY.push;

/**
 * Subscribes this device to push through the live pipeline (USE-1, C8).
 *
 * A stand-in while Settings is legacy, so the subscription can be checked on a
 * real phone. It offers nothing where push cannot work (an unsupported browser,
 * a tier without a VAPID key), and says why where it is blocked.
 */
export function PushCheck() {
  const { state, refresh } = usePermissionState();
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<PushSubscribeResult | null>(null);

  if (state === "unsupported") return null;
  if (state === "not-installed") {
    return (
      <Text as="p" variant="secondary" tone="muted">
        {COPY.notInstalled}
      </Text>
    );
  }
  if (state === "denied") {
    return (
      <Text as="p" variant="secondary" tone="muted">
        {COPY.denied}
      </Text>
    );
  }

  async function subscribe(): Promise<void> {
    setBusy(true);
    try {
      setResult(await subscribeToPush());
    } finally {
      setBusy(false);
      refresh();
    }
  }

  return (
    <div className="flex flex-col items-start gap-(--space-2)">
      <Button variant="secondary" onClick={subscribe} disabled={busy}>
        {busy ? COPY.working : state === "granted" ? COPY.renew : COPY.turnOn}
      </Button>
      {result === "subscribed" ? (
        <Text as="p" variant="secondary" tone="muted" role="status">
          {COPY.subscribed}
        </Text>
      ) : result === "error" ? (
        <Text as="p" variant="secondary" tone="muted" role="status">
          {COPY.error}
        </Text>
      ) : null}
    </div>
  );
}
