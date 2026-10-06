"use client";

import * as React from "react";

import { BLOCK_KIND_WORDS, Button, HelperText, ListRow, SkeletonRow, StatusLine, Text } from "@syn/ui";
import { DEFAULT_BLOCK_ORDER } from "@syn/constants";
import type { BlockKind } from "@syn/types";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { YOUR_DAY_COPY as COPY } from "../../_components/copy";

/**
 * Block order — UX v1.1 §4.14: "a sortable list of the … kinds with drag
 * handles". The handles are DYN-9's `DragLayer reorder`; until then each row
 * carries *Move up / Move down* — the same two-step rule the editor follows
 * (§13 #4: every drag has a tap fallback, and the fallback ships first).
 *
 * SIX KINDS, NOT EIGHT. Training and break are placed each morning (§3.7),
 * so the order a person edits never contains them — `blockOrderSchema`
 * refuses a list that does. Each move saves at once: a list is a canvas, and
 * a canvas never asks to save.
 */
export function BlockOrder() {
  const online = useOnline();
  const utils = trpc.useUtils();
  const me = trpc.user.me.useQuery();
  const update = trpc.user.updatePreferences.useMutation();
  const [error, setError] = React.useState<string | null>(null);

  const order: readonly BlockKind[] =
    me.data === undefined
      ? []
      : me.data.blockOrder.length === 0
        ? DEFAULT_BLOCK_ORDER
        : me.data.blockOrder;

  async function move(index: number, direction: -1 | 1): Promise<void> {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(index, 1);
    if (moved === undefined) return;
    next.splice(target, 0, moved);
    setError(null);
    try {
      await update.mutateAsync({ blockOrder: next });
      await utils.user.me.invalidate();
    } catch {
      setError(COPY.orderError);
    }
  }

  if (me.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }

  const disabled = !online || update.isPending;

  return (
    <div className="flex flex-col gap-(--space-4)">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}
      <Text as="p" variant="secondary" tone="secondary">
        {COPY.orderBody}
      </Text>
      <ol className="flex flex-col">
        {order.map((kind, index) => (
          <ListRow
            key={kind}
            as="li"
            title={BLOCK_KIND_WORDS[kind]}
            trailing={
              <span className="flex gap-(--space-1)">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled || index === 0}
                  aria-label={`${COPY.moveUp}: ${BLOCK_KIND_WORDS[kind]}`}
                  onClick={() => void move(index, -1)}
                >
                  {COPY.moveUp}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled || index === order.length - 1}
                  aria-label={`${COPY.moveDown}: ${BLOCK_KIND_WORDS[kind]}`}
                  onClick={() => void move(index, 1)}
                >
                  {COPY.moveDown}
                </Button>
              </span>
            }
          />
        ))}
      </ol>
      {error === null ? null : <HelperText error>{error}</HelperText>}
    </div>
  );
}
