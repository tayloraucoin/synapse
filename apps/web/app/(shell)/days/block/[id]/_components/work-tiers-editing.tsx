"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toastUndo } from "@syn/ui";
import type { WorkTier } from "@syn/utils";
import {
  SwipeRow,
  WorkTierSections,
  type WorkTierAddChoice,
} from "@/components/planner/block-view";
import { FromLinearSheet } from "@/components/work/from-linear/from-linear-sheet";
import { ThisWeekPool } from "@/components/work/this-week/this-week-pool";
import { TIER_HUE } from "@/components/work/view";
import { tierOrderWrites } from "@/lib/data/block-panel";
import {
  blockFitLine,
  blockWorkTiers,
  BLOCK_WORK_COPY as WORK,
  type BlockWorkRow,
} from "@/lib/data/block-view-work";
import { weekdayName } from "@/lib/data/set-up-view";
import { useAccount } from "@/lib/data/use-account";
import type { BlockView } from "@/lib/data/use-block-view";
import { useWorkWrites } from "@/lib/data/use-work-writes";
import { addSheetRoute, itemSheetRoute } from "@/lib/routes";
import { BLOCK_EDIT_COPY as COPY } from "./copy";

/**
 * A This week Work block in editing (USE-50; block-view/states/work-tiers.md,
 * work-add-to-a-tier.md): `WorkTierSections` over the date's work slots, the
 * fit line from `blockFitLine`. Every write is the date's slot, so the usual
 * Monday is unchanged (C-USE-block-view-kind-3): a grip reorders within a
 * tier (`moveWork`, the slot's sort order), a swipe takes the slot off the
 * date with Undo (`unplaceWork`; the item goes back to the pool). A tier's
 * add menu runs step 8's choices with the tier and the date set: New item
 * opens the add sheet, From the pool USE-79's pool sheet, From Linear
 * USE-52's sheet; what each then does is its own ticket's.
 */

function seededTier(open: string | undefined): WorkTier | null {
  const tier = open?.startsWith("tier-add:") ? open.slice(9) : null;
  return tier === "urgent" ||
    tier === "primary" ||
    tier === "secondary" ||
    tier === "stretch"
    ? tier
    : null;
}

export function useWorkTiersEditing({
  data,
  dateKey,
  open,
  announce,
}: {
  data: BlockView | null;
  dateKey: string | null;
  /** The scenario's `view.open`. */
  open: string | undefined;
  announce: (words: string) => void;
}) {
  const router = useRouter();
  const writes = useWorkWrites();
  const firstName = (useAccount().data?.name ?? "").split(" ")[0] ?? "";
  const [swipeId, setSwipeId] = React.useState<string | null>(null);
  const [pool, setPool] = React.useState(false);
  const [linear, setLinear] = React.useState<WorkTier | null>(null);

  const isWork =
    data !== null &&
    dateKey !== null &&
    data.block.block.kind === "work" &&
    data.block.block.fill !== "set_items";
  if (!isWork) return null;

  const block = data;
  const date = dateKey;
  const tiers = blockWorkTiers(block);
  const weekday = weekdayName(block.day.weekday);
  const here = () => `${window.location.pathname}${window.location.search}`;

  function reorder(tier: WorkTier, ids: string[]) {
    const rows = tiers.find((t) => t.tier === tier)?.rows ?? [];
    const moves = tierOrderWrites(
      rows.map((row) => ({ id: row.slotId, sortOrder: row.sortOrder })),
      ids,
    );
    void (async () => {
      for (const move of moves) {
        await writes.moveWork(move);
      }
    })().catch(() => {});
  }

  async function remove(row: BlockWorkRow) {
    setSwipeId(null);
    const write = await writes.unplaceWork({ slotId: row.slotId });
    const words = COPY.removed(row.title, `from this ${weekday}`);
    announce(words);
    toastUndo({ text: words, onUndo: () => void writes.undo(write.undo) });
  }

  function add(tier: WorkTier, choice: WorkTierAddChoice) {
    if (choice === "new") {
      router.push(
        addSheetRoute(here(), {
          block: block.block.block.id,
          // The add sheet presets Primary and Secondary (USE-37) [ASSUMPTION].
          ...(tier === "primary" || tier === "secondary" ? { tier } : {}),
        }),
        { scroll: false },
      );
    } else if (choice === "pool") {
      setPool(true);
    } else {
      setLinear(tier);
    }
  }

  const node = (
    <WorkTierSections<BlockWorkRow & { id: string }>
      fitLine={blockFitLine(block)}
      tiers={tiers.map((tier) => ({
        tier: tier.tier,
        word: tier.word,
        hue: TIER_HUE[tier.tier],
        rows: tier.rows.map((row) => ({ ...row, id: row.slotId })),
      }))}
      words={{
        addTo: WORK.addTo,
        choices: {
          new: { label: WORK.newItem, line: WORK.newItemLine },
          pool: { label: WORK.fromPool, line: WORK.fromPoolLine },
          linear: {
            label: WORK.fromLinear,
            line: WORK.fromLinearLine(firstName),
          },
        },
        reorder: (title) => `Reorder ${title}`,
        rowName: (row) => WORK.rowName(row.title, row.range),
      }}
      onRow={(row) =>
        router.push(itemSheetRoute(here(), row.workItemId), { scroll: false })
      }
      onReorder={reorder}
      onAdd={add}
      openTier={seededTier(open)}
      wrapRow={(row, body) => (
        <SwipeRow
          open={swipeId === row.id}
          onOpenChange={(next) => setSwipeId(next ? row.id : null)}
          removeLabel={COPY.remove}
          removeName={COPY.removeName(row.title)}
          onRemove={() => void remove(row)}
        >
          {body}
        </SwipeRow>
      )}
    />
  );

  const sheets = (
    <>
      <ThisWeekPool
        open={pool}
        onOpenChange={setPool}
        dateKey={date}
        onPlaced={() => setPool(false)}
      />
      {linear === null ? null : (
        <FromLinearSheet
          open
          onOpenChange={(next) => {
            if (!next) setLinear(null);
          }}
          dateKey={date}
          blockId={block.block.block.id}
          tier={linear}
        />
      )}
    </>
  );

  return { node, sheets };
}
