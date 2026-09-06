"use client";

import * as React from "react";

import { Button, ResponsiveSheet, Text } from "@syn/ui";

import { SheetHost } from "@/components/page-frame";
import { isAndroid, isIOS, isIPadOS } from "@/lib/pwa/install-detection";

import {
  PLATFORM_STEPS_COPY as COPY,
  type PlatformStepsKey,
} from "./copy";

/**
 * *How* — the platform's own steps, as an ordered list.
 *
 * ONE SHEET, TWO JOBS. SET-9 opens it for notifications and SYS-5 will open it
 * for installing; the platform detection, the list markup and the "no
 * screenshots" rule are the same in both, and two sheets would be two places
 * to update when an OS moves a menu.
 *
 * NO EXTERNAL LINK. The document says the steps must not require one, and it
 * is right: a link to Apple's support site is a page that changes without us,
 * loads slowly on a phone, and takes someone out of the app to fix something
 * about the app.
 *
 * THE PLATFORM IS DETECTED AFTER MOUNT, so the server renders nothing
 * platform-specific and the steps cannot be wrong on first paint.
 */
export function PlatformStepsSheet({
  open,
  kind,
  onOpenChange,
}: {
  open: boolean;
  kind: "notifications" | "install";
  onOpenChange: (open: boolean) => void;
}) {
  const [platform, setPlatform] = React.useState<
    "ios" | "android" | "desktop"
  >("desktop");

  React.useEffect(() => {
    setPlatform(
      isIOS() || isIPadOS() ? "ios" : isAndroid() ? "android" : "desktop",
    );
  }, []);

  const key = `${kind}-${platform}` as PlatformStepsKey;
  const steps = COPY.steps[key];

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={
          kind === "install" ? COPY.installTitle : COPY.notificationsTitle
        }
        footer={
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>{COPY.close}</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <Text as="p" tone="secondary">
            {kind === "install" ? COPY.installIntro : COPY.notificationsIntro}
          </Text>

          <ol className="flex list-decimal flex-col gap-(--space-2) ps-(--space-5)">
            {steps.map((step) => (
              <li key={step}>
                <Text as="span" variant="body">
                  {step}
                </Text>
              </li>
            ))}
          </ol>
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}
