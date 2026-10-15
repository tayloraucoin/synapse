"use client";

import Link from "next/link";
import { ScreenFrame, Text } from "@syn/ui";
import { ClientsSettings } from "@/components/account";
import { settingsRoute } from "@/lib/routes";

/**
 * USE-86's states on `/dev/parts?state=settings-*`: Connections with
 * clients on, the client sheet and the workspace sheet. The Connections page
 * is USE-85's; until it lands this frame stands in for it, its header and
 * the board's own Google Calendar stand-in line over `ClientsSettings`.
 */

const COPY = {
  back: "Settings",
  backLabel: "Back to Settings",
  title: "Connections",
  google: 'Google Calendar · as drawn on "USE — set up"',
} as const;

export function SettingsClientsPart() {
  return (
    <ScreenFrame>
      <div className="flex flex-col gap-(--space-6) pb-(--space-8)">
        <header className="border-border flex flex-col gap-(--space-1) border-b pb-(--space-3)">
          <Link
            href={settingsRoute()}
            aria-label={COPY.backLabel}
            className="text-muted-foreground text-(length:--fs-secondary)"
          >
            ‹ {COPY.back}
          </Link>
          <Text as="h1" variant="heading" weight={600}>
            {COPY.title}
          </Text>
        </header>
        <Text as="p" variant="secondary" tone="muted">
          {COPY.google}
        </Text>
        <ClientsSettings />
      </div>
    </ScreenFrame>
  );
}
