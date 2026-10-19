"use client";

import { teamsWord, type PoolClientChoice } from "@/lib/data/pool-view";
import { ClientTile } from "../client-tile";
import { POOL_SHEET_COPY as COPY } from "./copy";
import { FilterSheet } from "./filter-sheet";

/**
 * ClientFilterSheet — "All clients ▾" in the pool sheet (client-filter.md):
 * "Client" and ×, All clients, then each client in Settings' order with its
 * tile and letter and how many Linear teams its work spans, and the foot
 * line. A pick narrows the pool sheet's tabs only, never the days
 * (D-USE-54); the order is not set here (D-USE-96).
 */
export interface ClientFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: readonly PoolClientChoice[];
  value: string | null;
  onPick: (clientId: string | null) => void;
}

export function ClientFilterSheet({
  open,
  onOpenChange,
  clients,
  value,
  onPick,
}: ClientFilterSheetProps) {
  return (
    <FilterSheet<string | null>
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.client}
      value={value}
      onPick={onPick}
      foot={COPY.clientFoot}
      choices={[
        { value: null, label: COPY.allClients },
        ...clients.map((client) => ({
          value: client.id,
          label: client.name,
          lead: (
            <ClientTile
              letter={client.letter}
              hue={client.hue}
              className="font-bold"
            />
          ),
          line: teamsWord(client.teams),
        })),
      ]}
    />
  );
}
