"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { WorkTier } from "@syn/types";
import {
  Checkbox,
  cn,
  IconTile,
  InlineAddRow,
  RegionRetry,
  Skeleton,
  toastUndo,
} from "@syn/ui";
import { weekdayIndex } from "@syn/utils";
import { OfflineLine, RowMenu } from "@/components/planner";
import { BLOCK_HUE } from "@/components/planner/block-hue";
import { BlockViewColumn, clockLabel } from "@/components/planner/block-view";
import {
  BLOCK_PANEL_WORDS,
  type BlockPanelItemRow,
} from "@/lib/data/block-panel";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import {
  useBlockPanel,
  useBlockPanelParams,
  type OpenedBlock,
} from "@/lib/data/use-block-panel";
import { itemSheetRoute, todayRoute } from "@/lib/routes";
import { BlockPanel } from "./block-panel";
import { BLOCK_PANEL_COPY as COPY } from "./copy";
import { PanelTiers } from "./panel-tiers";

/**
 * BlockPanelHost — the Block panel where a desk screen opens it (USE-76):
 * `?panel=block&block=&on=` read once here, the panel mounted over the
 * screen. `from` is the screen: the Week's Time lens plans (no checkboxes,
 * D-USE-100); Today's day column on today checks (D-USE-74,
 * checking-today.md). Closing clears the query, and focus goes back to the
 * block that opened it (`data-block-opener`, C-USE-block-panel-2).
 *
 * The body is Block view's for that date (USE-48): a non-work block's items
 * on `BlockViewColumn`, writes through `useBlockDayWrites` on that date only
 * (C-USE-block-panel-non-work-block-2), each row's right-click menu USE-18's
 * `RowMenu`; a Work block's tiers through `PanelTiers`, their add rows and
 * drops the screen's placing (USE-75's `place`).
 */

export type BlockPanelFrom = "week" | "today";

export interface BlockPanelHostProps {
  from: BlockPanelFrom;
  /** The Work tiers' add row, the screen's "+ Add to <tier>" search. */
  addRow?: (
    at: OpenedBlock & { tier: WorkTier; word: string },
  ) => React.ReactNode;
  /** A Work tier's drop target id, for the screen's DragToPlace. */
  dropId?: (at: OpenedBlock & { tier: WorkTier }) => string;
}

/** The block in the week or the day column that opened `opened`. */
export const blockOpenerKey = (opened: OpenedBlock) =>
  `${opened.dateKey}:${opened.blockId}`;

export function BlockPanelHost({ from, addRow, dropId }: BlockPanelHostProps) {
  const { opened, close } = useBlockPanelParams();
  const closeAndReturn = React.useCallback(() => {
    const key = opened ? blockOpenerKey(opened) : null;
    close();
    if (key === null) return;
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-block-opener="${key}"]`)
        ?.focus({ preventScroll: true });
    });
  }, [opened, close]);
  if (!opened) return null;
  return (
    <OpenedPanel
      key={blockOpenerKey(opened)}
      opened={opened}
      from={from}
      onClose={closeAndReturn}
      addRow={addRow}
      dropId={dropId}
    />
  );
}

function OpenedPanel({
  opened,
  from,
  onClose,
  addRow,
  dropId,
}: {
  opened: OpenedBlock;
  from: BlockPanelFrom;
  onClose: () => void;
  addRow: BlockPanelHostProps["addRow"];
  dropId: BlockPanelHostProps["dropId"];
}) {
  const router = useRouter();
  const source = useDataSource();
  const offline = useIsOffline();
  const todayKey = source.todayKey();
  const isToday = opened.dateKey === todayKey;
  // Checking is today's block from Today (D-USE-100: from the Week it plans).
  const checking = from === "today" && isToday;
  const panel = useBlockPanel(opened, checking);
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  const head = panel.head;
  const day = head?.day ?? BLOCK_PANEL_WORDS.day(opened.dateKey);
  const name = head?.name ?? "";
  const weekday = WEEKDAYS[weekdayIndex(opened.dateKey)] ?? "";

  const openItemSheet = (id: string, swap: boolean) => {
    const here = `${window.location.pathname}${window.location.search}`;
    router.push(itemSheetRoute(here, id, swap ? "swap" : undefined), {
      scroll: false,
    });
  };

  async function remove(row: BlockPanelItemRow) {
    const token = await panel.dayWrites.remove(row);
    setAnnouncement(COPY.removed(row.title));
    toastUndo({
      text: COPY.removed(row.title),
      onUndo: () => void panel.dayWrites.undo(token),
    });
  }

  function move(
    rows: readonly BlockPanelItemRow[],
    row: BlockPanelItemRow,
    by: -1 | 1,
  ) {
    const ids = rows.map((r) => r.id);
    const at = ids.indexOf(row.id);
    const to = at + by;
    if (at === -1 || to < 0 || to >= ids.length) return;
    [ids[at], ids[to]] = [ids[to] as string, row.id];
    void panel.dayWrites.reorder(ids);
  }

  let body: React.ReactNode;
  if (panel.isError) {
    body = (
      <RegionRetry
        label={COPY.failed}
        onRetry={panel.retry}
        className="py-(--space-6)"
      />
    );
  } else if (head === null) {
    body = <PanelSkeleton label={COPY.loading(day)} />;
  } else if (head.kind === "work") {
    body = panel.tiers ? (
      <PanelTiers
        tiers={panel.tiers}
        onReorder={(tier, ids) => {
          void panel.reorderTier(tier, ids);
          const moved = panel.tiers
            ?.flatMap((t) => t.rows)
            .find((row) => row.id === ids[0]);
          if (moved) setAnnouncement(COPY.moved(moved.title, tier));
        }}
        title={(row) => (
          <button
            type="button"
            onClick={() => openItemSheet(row.workItemId, false)}
            className="max-w-full truncate rounded-(--radius-control) text-start outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {row.title}
          </button>
        )}
        addRow={
          addRow ? (tier, word) => addRow({ ...opened, tier, word }) : null
        }
        dropId={dropId ? (tier) => dropId({ ...opened, tier }) : null}
      />
    ) : (
      <PanelSkeleton label={COPY.loading(name)} />
    );
  } else if (panel.rows === null || panel.items === null) {
    body = <PanelSkeleton label={COPY.loading(name)} />;
  } else {
    const rows = panel.rows;
    const lengths = new Map(rows.map((row) => [row.id, row.lengthMin]));
    // [ASSUMPTION] Rows at their own height, as the desk draws them, not
    // stretched by length as the phone's: the length shows, the height doesn't.
    const flat = rows.map((row) => ({ ...row, lengthMin: null }));
    const swaps = head.kind === "training";
    body = (
      <BlockViewColumn
        rows={flat}
        label={name}
        block={{
          startsAt: panel.items.block.startsAt,
          endsAt: panel.items.block.endsAt,
        }}
        leading={(row) => (
          <>
            {checking && !row.transition ? (
              <label className="-mx-3 flex size-(--target) shrink-0 items-center justify-center">
                <Checkbox
                  checked={row.done}
                  onCheckedChange={(next) => {
                    const item = rows.find((r) => r.id === row.id);
                    if (item) void panel.dayWrites.check(item, next === true);
                  }}
                  aria-label={COPY.check(
                    row.title,
                    clockLabel(row.startsAt),
                    lengths.get(row.id) == null
                      ? ""
                      : COPY.length(lengths.get(row.id)!),
                  )}
                  className="data-[state=checked]:border-text-muted data-[state=checked]:bg-text-muted"
                />
              </label>
            ) : null}
            <span
              aria-hidden="true"
              className="flex w-4.5 shrink-0 justify-center"
            >
              {row.icon ? <IconTile icon={row.icon} variant="bare" /> : null}
            </span>
          </>
        )}
        title={(row) =>
          row.transition ? (
            <span className="italic text-text-muted">{row.title}</span>
          ) : (
            <button
              type="button"
              data-row-open
              onClick={() => openItemSheet(row.id, false)}
              className="max-w-full truncate rounded-(--radius-control) text-start text-(length:--fs-body) outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {row.title}
            </button>
          )
        }
        trailing={(row) => {
          const length = lengths.get(row.id);
          return (
            <>
              {swaps && !row.transition ? (
                <button
                  type="button"
                  aria-label={COPY.swapName(row.title)}
                  onClick={() => openItemSheet(row.id, true)}
                  className="shrink-0 rounded-(--radius-control) text-(length:--fs-label) font-semibold text-ink underline outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {COPY.swap}
                </button>
              ) : null}
              {length == null ? null : (
                <span className="shrink-0 text-(length:--fs-caption) leading-(--lh-caption) text-text-muted tabular-nums">
                  {COPY.length(length)}
                </span>
              )}
            </>
          );
        }}
        wrapRow={(row, rowBody) => {
          const index = rows.findIndex((r) => r.id === row.id);
          const item = rows[index]!;
          return (
            <RowMenu
              clone={rowBody}
              words={{
                swap: COPY.swap,
                edit: COPY.edit,
                moveUp: COPY.moveUp,
                moveDown: COPY.moveDown,
                notToday: isToday ? COPY.notToday : COPY.remove,
                more: COPY.more(row.title),
                menu: COPY.menu(row.title),
              }}
              open={menuId === row.id}
              onOpenChange={(open) => setMenuId(open ? row.id : null)}
              canMoveUp={index > 0}
              canMoveDown={index < rows.length - 1}
              onSwap={() => openItemSheet(row.id, true)}
              onEdit={() => openItemSheet(row.id, false)}
              onMoveUp={() => move(rows, item, -1)}
              onMoveDown={() => move(rows, item, 1)}
              onNotToday={() => void remove(item)}
            >
              {rowBody}
            </RowMenu>
          );
        }}
        empty={
          <p className="text-(length:--fs-body) text-text-muted">
            {COPY.empty(name)}
          </p>
        }
        add={{
          at: null,
          node: (
            <InlineAddRow
              label={COPY.addTo(name).replace(/^\+ /, "")}
              placeholder={COPY.addPlaceholder}
              maxLength={120}
              keepOpen
              onSubmit={(title) => {
                void panel.dayWrites.add(title, rows);
                setAnnouncement(COPY.added(title, name, day));
              }}
            />
          ),
        }}
        overMin={panel.items.reflow.overMin}
      />
    );
  }

  return (
    <BlockPanel
      day={day}
      name={name}
      meta={head?.meta ?? ""}
      hue={head ? BLOCK_HUE[head.kind] : "slate"}
      openDay={
        checking
          ? null
          : {
              href: isToday
                ? todayRoute()
                : todayRoute({ date: opened.dateKey }),
              label: COPY.openDayName(
                weekday,
                Number(opened.dateKey.slice(8, 10)),
              ),
            }
      }
      status={offline ? <OfflineLine text={COPY.offline} /> : null}
      scope={head?.scope ?? null}
      onClose={onClose}
    >
      {body}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </BlockPanel>
  );
}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function PanelSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="flex flex-col">
      {["w-2/5", "w-1/3", "w-1/2"].map((width) => (
        <div
          key={width}
          className={cn(
            "flex h-(--row-min) items-center border-b border-hairline",
          )}
        >
          <Skeleton className={cn("h-3", width)} />
        </div>
      ))}
    </div>
  );
}
