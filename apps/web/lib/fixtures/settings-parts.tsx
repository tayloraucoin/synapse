"use client";

import { ConnectionsPage } from "@/components/account";

/**
 * Settings › Connections' states on `/dev/parts?state=settings-*`: USE-85's
 * page as `/settings/connections` renders it, so every state of the page
 * and USE-86's clients and sheets is reachable here too.
 */
export function SettingsClientsPart() {
  return <ConnectionsPage />;
}
