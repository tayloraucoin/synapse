"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BLOCK_HUE } from "@/components/planner/block-hue";
import { CloseCard, NextRows } from "@/components/planner/close-card";
import { NotDoneList } from "@/components/planner/not-done-list";
import type { NowClosing } from "@/lib/data/block-close";
import type { useBlockClose } from "@/lib/data/use-block-close";
import { todayScheduleRoute } from "@/lib/routes";
import { clockLabel, NOW_COPY } from "./copy";

const COPY = NOW_COPY.close;

/**
 * The last block's pause before Now's empty state (block-complete
 * last-block [ASSUMPTION]: about 4 s). It holds while the pointer is over
 * the card or keyboard focus is inside it, so it never times out under a
 * screen reader's own navigation.
 */
export const LAST_BLOCK_PAUSE_MS = 4000;

/**
 * Block complete with items left (USE-25): the close card in the block's
 * place on Now, its list the close's own. Start <next> and × both put the
 * next block in focus; after the last block, × or the pause leaves Now
 * empty. Undo stays on a moved row until the card closes.
 */
export function NowCloseCard({
  closing,
  blockClose,
  onAnnounce,
}: {
  closing: NowClosing;
  blockClose: ReturnType<typeof useBlockClose>;
  onAnnounce: (words: string) => void;
}) {
  const router = useRouter();
  const card = blockClose.state.card;
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const [held, setHeld] = React.useState(false);
  const [first, second] = closing.next;
  const last = first === undefined;
  const seeded = card?.seeded ?? false;

  // Focus on settle: the heading (words-and-access.md).
  React.useEffect(() => {
    if (!seeded) headingRef.current?.focus();
  }, [seeded]);

  const close = React.useCallback(
    () => blockClose.close(first?.id ?? null),
    [blockClose, first],
  );

  React.useEffect(() => {
    if (!last || seeded || held) return;
    const timer = setTimeout(close, LAST_BLOCK_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [last, seeded, held, close]);

  const items = blockClose.itemsOf(closing);
  const shown = items.filter((item) => item.state !== "leave");
  const target = closing.later;

  return (
    <div
      className="my-auto py-(--space-6)"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={(event) => {
        if (event.target.matches(":focus-visible")) setHeld(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
      }}
    >
      <CloseCard
        headingRef={headingRef}
        title={NOW_COPY.blockComplete(closing.block.name)}
        hue={BLOCK_HUE[closing.block.kind]}
        close={{ label: COPY.closeName(closing.block.name), onPress: close }}
        next={
          first ? (
            <NextRows
              heading={COPY.next}
              rows={[first, second].flatMap((block, index) =>
                block
                  ? [
                      {
                        key: block.id,
                        name: index === 0 ? block.name : COPY.then(block.name),
                        startsAt: clockLabel(block.startsAt),
                        hue: BLOCK_HUE[block.kind],
                      },
                    ]
                  : [],
              )}
            />
          ) : null
        }
        nothingAfter={last ? COPY.nothingAfter : null}
        action={
          first
            ? { label: NOW_COPY.startBlock(first.name), onPress: close }
            : {
                label: NOW_COPY.seeTheWholeDay,
                quiet: true,
                onPress: () => router.push(todayScheduleRoute()),
              }
        }
        notDone={
          items.length === 0
            ? null
            : {
                label: COPY.notDone(items.map((item) => item.title)),
                open: card?.open ?? false,
                onOpenChange: blockClose.toggle,
                list: (
                  <NotDoneList
                    rows={shown.map((item) => ({
                      id: item.id,
                      title: item.title,
                      movedLine:
                        item.state === "moved" && item.movedTo
                          ? COPY.movedTo(item.movedTo)
                          : null,
                      later: target
                        ? {
                            label: COPY.later,
                            name: COPY.laterName(item.title),
                            onPress: () => {
                              void blockClose
                                .later(item, closing)
                                .then(() =>
                                  onAnnounce(
                                    COPY.announceMoved(
                                      item.title,
                                      target.blockName,
                                    ),
                                  ),
                                );
                            },
                          }
                        : null,
                      leave: {
                        label: COPY.leave,
                        name: COPY.leaveName(item.title),
                        onPress: () => blockClose.leave(item, closing),
                      },
                      undo: {
                        label: COPY.undo,
                        name: COPY.undoName(item.title),
                        onPress: () => void blockClose.undoLater(item, closing),
                      },
                    }))}
                  />
                ),
              }
        }
      />
    </div>
  );
}
