import { Suspense } from "react";
import type { Metadata } from "next";
import { CONNECTIONS_COPY, ConnectionsPage } from "@/components/account";

export const metadata: Metadata = { title: CONNECTIONS_COPY.title };

/**
 * `/settings/connections` (USE-85): Google calendars, Linear workspaces and
 * clients, on fixtures through `useConnections`. Connect Linear on the pool
 * sheet and the Item sheet lands here.
 */
export default function ConnectionsRoutePage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Suspense>
        <ConnectionsPage />
      </Suspense>
    </main>
  );
}
