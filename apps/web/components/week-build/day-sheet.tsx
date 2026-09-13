"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  BLOCK_KIND_WORDS,
  Button,
  CollapsiblePanel,
  ConfirmDialog,
  HelperText,
  ItemIcon,
  ListRow,
  PickerList,
  ResponsiveSheet,
  SegmentedControl,
  SkeletonRow,
  StatusLine,
  Tag,
  Text,
  type PickerListItem,
} from "@syn/ui";
import type { BlockKind, DayItemView, DayShape, HabitSummaryView, TemplateSummaryView } from "@syn/types";
import { formatClock, weekDates, weekKeyOf, weekdayForDayKey } from "@syn/utils";

import { OneOffSheet } from "@/components/one-off-sheet";
import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { settingsYourDayBlockRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { WEEK_COPY as COPY } from "./copy";

/**
 * WK-02 amended — one day's plan, by block (UX v1.1 §4.13).
 *
 * "A row per block kind present, each a `PickerList` of that kind's templates
 * with target status, plus the shape toggle at the top and *Add a one-off* at
 * the bottom." Choosing applies immediately (official spec §4.5): the day's
 * blocks exist the moment the choice is made.
 *
 * THE SHEET NEVER RECONCILES. Every change is one `week.assignBlocks` with the
 * day's whole assignment — the blocks the preview already shows, plus the one
 * change — and the materialiser keeps what is touched (DYN-5). The
 * *Structured* toggle reads the profile's default plan for the date so the
 * day gets the blocks the pre-fill would have given it.
 *
 * A SET DAY IS A RECORD (cross-cutting §8.1): its blocks and shape are
 * read-only here; its one-offs are not. The same holds for a past day.
 *
 * THE TRADE (R25): *Swap with…* lists the other days; the confirm is one
 * sentence with two answers, and `week.tradeWorkouts` writes both days'
 * workout items — the rows the quick-pick reads.
 */

type DayView = RouterOutputs["week"]["dayPreview"];
type Assignment = { kind: BlockKind; templateId: string | null | "pool" };

const KIND_ORDER: readonly BlockKind[] = ["orient", "morning", "prep", "work", "activity", "wind_down", "training", "break"];

export function DaySheet({
  open,
  date,
  onOpenChange,
  onChanged,
}: {
  open: boolean;
  date: string;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const online = useOnline();
  const utils = trpc.useUtils();

  const [oneOffTarget, setOneOffTarget] = React.useState<{ id?: string } | null>(null);
  const [swapping, setSwapping] = React.useState(false);
  const [tradeWith, setTradeWith] = React.useState<string | null>(null);
  const [tradeError, setTradeError] = React.useState<string | null>(null);

  const preview = trpc.week.dayPreview.useQuery({ date }, { enabled: open });
  const week = trpc.week.get.useQuery({ week: weekKeyOf(date) }, { enabled: open });
  const templates = trpc.template.list.useQuery({ includeArchived: true }, { enabled: open });
  const focuses = trpc.habit.list.useQuery({ includeArchived: false, types: ["deep_work"] }, { enabled: open });
  const assign = trpc.week.assignBlocks.useMutation();
  const trade = trpc.week.tradeWorkouts.useMutation();

  const day: DayView | undefined = preview.data;
  const isPast = day?.mode === "record";
  const confirmed = day?.confirmedAt != null;
  const readOnly = isPast || confirmed || !online || assign.isPending;
  const zone = day?.timezone ?? "UTC";
  const items = day?.blocks.flatMap((block) => block.items) ?? [];
  const oneOffs = items.filter((item) => item.origin === "one_off");
  const all = templates.data ?? [];
  const weekDays = week.data?.days ?? [];
  const thisDay = weekDays.find((row) => row.date === date);

  async function refresh(): Promise<void> {
    await utils.week.dayPreview.invalidate({ date });
    await utils.week.get.invalidate();
    onChanged?.();
  }

  /** The day's assignment as the preview shows it — the base of every write. */
  function current(): Assignment[] {
    return (day?.blocks ?? [])
      .filter((block) => block.state !== "not_today")
      .map((block) => ({ kind: block.kind, templateId: block.state === "pooled" ? "pool" : block.templateId }));
  }

  async function assignWith(next: Assignment[], extra: { shape?: DayShape; focusHabitId?: string | null } = {}): Promise<void> {
    await assign.mutateAsync({ date, blocks: dedupe(next), ...extra });
    await refresh();
  }

  async function choose(kind: BlockKind, templateId: string | null | "pool"): Promise<void> {
    const next = current().map((row) => (row.kind === kind ? { kind, templateId } : row));
    if (!next.some((row) => row.kind === kind)) next.push({ kind, templateId });
    await assignWith(next);
  }

  async function setShape(shape: DayShape): Promise<void> {
    if (shape === "unstructured") {
      const orient = current().find((row) => row.kind === "orient") ?? { kind: "orient" as const, templateId: null };
      const windDown = current().find((row) => row.kind === "wind_down") ?? { kind: "wind_down" as const, templateId: null };
      await assignWith([orient, windDown], { shape, focusHabitId: null });
      return;
    }
    const plan = await utils.week.defaultPlan.fetch({ date });
    await assignWith(plan.blocks, { shape, focusHabitId: plan.focusHabitId });
  }

  async function setFocus(id: string | null): Promise<void> {
    await assignWith(current(), { focusHabitId: id });
  }

  async function confirmTrade(): Promise<void> {
    if (tradeWith === null) return;
    setTradeError(null);
    try {
      await trade.mutateAsync({ date, withDate: tradeWith });
      await refresh();
      setTradeWith(null);
      setSwapping(false);
    } catch (caught) {
      setTradeError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  const kinds = (day?.blocks ?? [])
    .filter((block) => block.state !== "not_today" && block.kind !== "training" && block.kind !== "break")
    .map((block) => block.kind)
    .filter((kind, index, list) => list.indexOf(kind) === index)
    .sort((a, b) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b));

  const focusRows = (focuses.data?.habits ?? []).filter((habit) => habit.type === "deep_work");
  const focusUsed = (habit: HabitSummaryView) => weekDays.filter((row) => row.focusLabel === habit.title).length;

  const otherDays = weekDates(weekKeyOf(date)).filter((other) => other !== date);
  const tradeDay = tradeWith === null ? null : weekDays.find((row) => row.date === tradeWith);

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={`${weekdayForDayKey(date)} ${date}`}
        subtitle={confirmed ? COPY.set : day?.mode === "live" ? COPY.today : undefined}
        size="tall"
        footer={
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>{COPY.done}</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-5)">
          {!online ? <StatusLine variant="offline" placement="inline" /> : null}

          {preview.isLoading ? (
            <div className="flex flex-col gap-(--space-2)">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : null}

          {day === undefined ? null : (
            <SegmentedControl
              label={COPY.shape}
              value={day.shape}
              onChange={(next) => void setShape(next)}
              options={[
                { value: "structured" as const, label: COPY.structured },
                { value: "unstructured" as const, label: COPY.unstructured },
              ]}
              disabled={readOnly}
            />
          )}

          {kinds.map((kind) => {
            const block = day?.blocks.find((row) => row.kind === kind);
            const value = block?.state === "pooled" ? "pool" : (block?.templateId ?? null);
            const ofKind = all.filter((template) => template.kind === kind);
            return (
              <section key={kind} className="flex flex-col gap-(--space-2)">
                <Text as="h3" variant="row-title">
                  {BLOCK_KIND_WORDS[kind]}
                </Text>
                <PickerList
                  groups={[
                    {
                      heading: BLOCK_KIND_WORDS[kind],
                      items: [
                        ...(kind === "morning" ? [{ id: "pool", title: COPY.menu }] : []),
                        ...templateItems(ofKind, value),
                      ],
                    },
                  ]}
                  value={value}
                  onSelect={(id) => void choose(kind, id === "" ? null : id === "pool" ? "pool" : id)}
                  noneLabel={COPY.none}
                  createLabel={COPY.newOfKind}
                  onCreate={() => router.push(settingsYourDayBlockRoute(kind))}
                  searchLabel={COPY.templateSearchLabel}
                  emptyText={COPY.templateEmpty}
                  presentation="inline"
                  className={readOnly ? "pointer-events-none opacity-50" : undefined}
                />
              </section>
            );
          })}

          {day?.shape === "structured" && kinds.includes("work") ? (
            <>
              <section className="flex flex-col gap-(--space-2)">
                <Text as="h3" variant="row-title">
                  {COPY.focus}
                </Text>
                <PickerList
                  groups={[
                    {
                      heading: COPY.focus,
                      items: focusRows.map((habit) => ({
                        id: habit.id,
                        icon: habit.icon,
                        title: habit.title,
                        meta:
                          habit.weeklyTarget === null
                            ? undefined
                            : COPY.ofThisWeek(focusUsed(habit), habit.weeklyTarget),
                      })),
                    },
                  ]}
                  value={day.focusHabitId}
                  onSelect={(id) => void setFocus(id === "" ? null : id)}
                  noneLabel={COPY.decideInTheMorning}
                  searchLabel={COPY.focusSearchLabel}
                  emptyText={COPY.focusEmpty}
                  presentation="inline"
                  className={readOnly ? "pointer-events-none opacity-50" : undefined}
                />
              </section>

              <section className="flex flex-col gap-(--space-2)">
                <Text as="h3" variant="row-title">
                  {COPY.training}
                </Text>
                <div className="flex items-center justify-between gap-(--space-3)">
                  <Text as="span">{thisDay?.workoutLabel ?? COPY.noWorkoutToday}</Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={readOnly}
                    aria-expanded={swapping}
                    onClick={() => setSwapping((value) => !value)}
                  >
                    {COPY.swapWith}
                  </Button>
                </div>
                {swapping ? (
                  <PickerList
                    groups={[
                      {
                        heading: COPY.swapWith,
                        items: otherDays.map((other) => {
                          const row = weekDays.find((candidate) => candidate.date === other);
                          return {
                            id: other,
                            title: weekdayForDayKey(other),
                            meta: row?.workoutLabel ?? COPY.nothingPlanned,
                            disabled: row?.confirmed ?? false,
                          };
                        }),
                      },
                    ]}
                    value={null}
                    onSelect={(id) => {
                      setTradeError(null);
                      setTradeWith(id);
                    }}
                    searchLabel={COPY.swapSearchLabel}
                    emptyText={COPY.swapEmpty}
                    presentation="inline"
                  />
                ) : null}
              </section>
            </>
          ) : null}

          <div className="flex flex-col gap-(--space-2)">
            <Text as="h3" variant="row-title">
              {COPY.oneOffs}
            </Text>
            {oneOffs.length === 0 ? null : (
              <ul className="flex flex-col">
                {oneOffs.map((item) => (
                  <ListRow
                    key={item.id}
                    as="li"
                    leading={<ItemIcon icon={item.icon} />}
                    title={item.title}
                    meta={oneOffMeta(item, zone)}
                    onClick={() => setOneOffTarget({ id: item.id })}
                  />
                ))}
              </ul>
            )}
            <Button
              variant="secondary"
              className="self-start"
              disabled={!online}
              onClick={() => setOneOffTarget({})}
            >
              {COPY.addOneOff}
            </Button>
          </div>

          <CollapsiblePanel
            trigger={
              <Text as="span" variant="row-title">
                {COPY.thisDay}
              </Text>
            }
          >
            <div className="flex flex-col gap-(--space-3)">
              <Text as="p" variant="caption" tone="secondary">
                {COPY.thisDayHelper}
              </Text>
              {(day?.blocks ?? []).length === 0 ? (
                <Text as="p" variant="body" tone="secondary">
                  {COPY.nothingPlanned}
                </Text>
              ) : (
                (day?.blocks ?? []).map((block) => (
                  <div key={block.id} className="flex flex-col gap-(--space-1)">
                    <Text as="span" variant="caption" tone="secondary">
                      {block.name ?? BLOCK_KIND_WORDS[block.kind]}
                    </Text>
                    {block.state === "pooled" ? (
                      <Text as="span" variant="caption" tone="secondary" className="ps-(--space-3)">
                        {COPY.setInTheMorning}
                      </Text>
                    ) : block.items.length === 0 ? null : (
                      <ul className="flex flex-col">
                        {block.items.map((item) => (
                          <ListRow
                            key={item.id}
                            as="li"
                            leading={<ItemIcon icon={item.icon} />}
                            title={item.title}
                            meta={readOnlyMeta(item, zone)}
                            tag={item.state === "done" ? "done" : undefined}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </CollapsiblePanel>

          {isPast ? <Tag>{COPY.pastDay}</Tag> : null}
          {assign.isError ? <HelperText error>{assign.error.message}</HelperText> : null}
        </div>
      </ResponsiveSheet>

      <ConfirmDialog
        open={tradeWith !== null}
        onOpenChange={(next) => {
          if (!next) setTradeWith(null);
        }}
        title={
          tradeDay === undefined || tradeDay === null
            ? ""
            : tradeDay.workoutLabel === null
              ? COPY.tradeTitleEmpty(tradeDay.weekday)
              : COPY.tradeTitle(tradeDay.weekday, tradeDay.workoutLabel)
        }
        description={tradeError ?? undefined}
        confirmLabel={COPY.trade}
        cancelLabel={COPY.cancel}
        busy={trade.isPending}
        onConfirm={() => void confirmTrade()}
        onCancel={() => setTradeWith(null)}
      />

      <OneOffSheet
        open={oneOffTarget !== null}
        date={date}
        itemId={oneOffTarget?.id}
        onOpenChange={(next) => {
          if (!next) setOneOffTarget(null);
        }}
        onSaved={() => void refresh()}
      />
    </SheetHost>
  );
}

/** One row per kind; the last write for a kind wins. */
function dedupe(rows: Assignment[]): Assignment[] {
  const byKind = new Map<BlockKind, Assignment>();
  for (const row of rows) byKind.set(row.kind, row);
  return [...byKind.values()];
}

/**
 * An archived template is absent from the picker unless it is this day's
 * current value, where it appears named as archived and cannot be re-picked
 * (SET-6's failure list). Hiding the row a day is actually using would leave
 * the field looking empty on a day that is planned.
 */
function templateItems(ofKind: readonly TemplateSummaryView[], currentId: string | null): PickerListItem[] {
  return ofKind
    .filter((template) => !template.archived || template.id === currentId)
    .map((template) => ({
      id: template.id,
      title: template.archived ? COPY.archivedSuffix(displayName(template)) : displayName(template),
      meta: metaFor(template),
      marker: mostBehind(ofKind, template),
      disabled: template.archived,
    }));
}

function displayName(template: TemplateSummaryView): string {
  return template.name.trim() === "" ? COPY.untitled : template.name;
}

/** "3 items · 45 min · 1 of 2 this week" — the target status (§4.13). */
function metaFor(template: TemplateSummaryView): string {
  const parts = [COPY.itemsAndMinutes(template.itemCount, template.totalMin)];
  if (template.weeklyTarget !== null) {
    parts.push(COPY.ofThisWeek(template.usedThisWeek, template.weeklyTarget));
  }
  return parts.join(" · ");
}

/**
 * The one marker, on one row — the targeted template furthest from its target.
 * Ties go to nobody: two rows carrying "most behind" says neither.
 */
function mostBehind(all: readonly TemplateSummaryView[], template: TemplateSummaryView): boolean {
  const targeted = all.filter((row) => row.weeklyTarget !== null && row.usedThisWeek < row.weeklyTarget);
  if (targeted.length === 0) return false;
  const shortfall = (row: TemplateSummaryView) => (row.weeklyTarget ?? 0) - row.usedThisWeek;
  const worst = Math.max(...targeted.map(shortfall));
  const leaders = targeted.filter((row) => shortfall(row) === worst);
  return leaders.length === 1 && leaders[0]?.id === template.id;
}

/** Icon · title · time · Fixed/Flexible (WK-02's one-off rows). */
function oneOffMeta(item: DayItemView, zone: string): string {
  const timing = item.scheduling === "hard" ? COPY.fixed : COPY.flexible;
  if (item.scheduledStart === null) return `${COPY.whenAnytime} · ${timing}`;
  return `${formatClock(item.scheduledStart, zone)} · ${timing}`;
}

/** Icon · title · time · duration (the read-only *This day* list). */
function readOnlyMeta(item: DayItemView, zone: string): string {
  const duration = item.durationMin === null ? null : COPY.minutes(item.durationMin);
  const clock = item.scheduledStart === null ? COPY.whenAnytime : formatClock(item.scheduledStart, zone);
  return duration === null ? clock : `${clock} · ${duration}`;
}
