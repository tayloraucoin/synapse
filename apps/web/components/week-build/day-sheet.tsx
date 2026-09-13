"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  Button,
  CollapsiblePanel,
  ConfirmDialog,
  HelperText,
  ItemIcon,
  ListRow,
  PickerList,
  ResponsiveSheet,
  SkeletonRow,
  StatusLine,
  Tag,
  Text,
  TimeField,
  type PickerListItem,
} from "@syn/ui";
import type { DayItemView, TemplateSummaryView } from "@syn/types";
import { formatClock, weekdayForDayKey } from "@syn/utils";

import { OneOffSheet } from "@/components/one-off-sheet";
import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { settingsYourDayRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { WEEK_COPY as COPY } from "./copy";

/**
 * WK-02 — one day's plan, and one of the two doors the List opens.
 *
 * CHOOSING A TEMPLATE APPLIES IT IMMEDIATELY (official spec §4.5). There is no
 * save button for the template field because there is nothing to save: the
 * day's items exist the moment the choice is made, which is what makes
 * tomorrow's list real tonight.
 *
 * A PAST DAY'S TEMPLATE AND START ARE READ-ONLY; ITS ONE-OFFS ARE NOT
 * (cross-cutting §8.1). A past day is a record. Adding an item you forgot to
 * log is annotation; re-planning it is rewriting.
 *
 * THE KEEP LINE IS ASKED, NOT GUESSED. `week.keepCount` runs the same
 * `untouchedWhere()` predicate the removal runs, so the number shown before
 * the choice is the number the choice produces. The view model carries a
 * derived `state`, not the assignment and completion columns, so counting on
 * the client here would be a second, weaker definition of "touched".
 */
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

  const [oneOffTarget, setOneOffTarget] = React.useState<
    { id?: string } | null
  >(null);
  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [pendingNone, setPendingNone] = React.useState(false);

  const preview = trpc.week.dayPreview.useQuery({ date }, { enabled: open });
  const templates = trpc.template.list.useQuery(
    { includeArchived: true },
    { enabled: open },
  );
  const keepCount = trpc.week.keepCount.useQuery({ date }, { enabled: open });

  const applyTemplate = trpc.week.applyTemplate.useMutation();
  const removeTemplate = trpc.week.removeTemplate.useMutation();
  const changeAnchor = trpc.week.changeAnchor.useMutation();

  const day = preview.data;
  // `record` is the past. The mode comes from the day itself, so this sheet
  // needs no second opinion about what "today" is.
  const isPast = day?.mode === "record";
  const zone = day?.timezone ?? "UTC";
  const items = day?.parts.flatMap((part) => part.items) ?? [];
  const oneOffs = items.filter((item) => item.origin === "one_off");

  const all = templates.data ?? [];
  const current = all.find((row) => row.name === day?.templateName) ?? null;
  const busy =
    applyTemplate.isPending ||
    changeAnchor.isPending ||
    removeTemplate.isPending;

  async function refresh(): Promise<void> {
    await utils.week.dayPreview.invalidate({ date });
    await utils.week.keepCount.invalidate({ date });
    await utils.week.get.invalidate();
    onChanged?.();
  }

  function choose(id: string): void {
    // PickerList emits "" for its *None* row.
    if (id === "") {
      // The keep line is shown first, then the same tap applies (WK-02).
      if ((keepCount.data ?? 0) > 0 && !pendingNone) {
        setPendingNone(true);
        return;
      }
      setPendingNone(false);
      void removeTemplate.mutateAsync({ date }).then(refresh);
      return;
    }
    setPendingNone(false);
    void applyTemplate.mutateAsync({ date, templateId: id }).then(refresh);
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={`${weekdayForDayKey(date)} ${date}`}
        subtitle={day?.mode === "live" ? COPY.today : undefined}
        size="tall"
        footer={
          <div className="flex items-center justify-between gap-(--space-2)">
            {day?.templateName !== null && day?.templateName !== undefined &&
            !isPast ? (
              <Button
                variant="ghost"
                disabled={!online}
                onClick={() => setRemoveOpen(true)}
              >
                {COPY.removeTemplate}
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={() => onOpenChange(false)}>{COPY.done}</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          {!online ? <StatusLine variant="offline" placement="inline" /> : null}

          {preview.isLoading ? (
            <div className="flex flex-col gap-(--space-2)">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : null}

          <div className="flex flex-col gap-(--space-2)">
            <Text as="h3" variant="row-title">
              {COPY.template}
            </Text>
            <PickerList
              groups={[
                {
                  heading: COPY.template,
                  items: templateItems(all, current),
                },
              ]}
              value={current?.id ?? null}
              onSelect={choose}
              noneLabel={COPY.none}
              createLabel={COPY.newTemplate}
              onCreate={() => {
                router.push(settingsYourDayRoute());
              }}
              searchLabel={COPY.templateSearchLabel}
              emptyText={COPY.templateEmpty}
              presentation="inline"
              className={
                isPast || !online || busy
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
            {pendingNone ? (
              <HelperText>{COPY.keepLine(keepCount.data ?? 0)}</HelperText>
            ) : null}
          </div>

          <TimeField
            label={COPY.dayStartsAt}
            helperText={COPY.dayStartsHelper}
            value={day?.anchorTime ?? null}
            disabled={isPast || !online || busy}
            onChange={(next) => {
              void changeAnchor
                .mutateAsync({ date, anchorTime: next })
                .then(refresh);
            }}
          />

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
            <div className="flex flex-col gap-(--space-2)">
              <Text as="p" variant="caption" tone="secondary">
                {COPY.thisDayHelper}
              </Text>
              {items.length === 0 ? (
                <Text as="p" variant="body" tone="secondary">
                  {COPY.nothingPlanned}
                </Text>
              ) : (
                <ul className="flex flex-col">
                  {items.map((item) => (
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
          </CollapsiblePanel>

          {isPast ? (
            <Tag>{COPY.pastDay}</Tag>
          ) : null}
        </div>
      </ResponsiveSheet>

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title={COPY.removeTitle(
          day?.templateName ?? "",
          weekdayForDayKey(date),
        )}
        description={COPY.removeBody}
        confirmLabel={COPY.remove}
        cancelLabel={COPY.keep}
        busy={removeTemplate.isPending}
        onConfirm={() => {
          void removeTemplate.mutateAsync({ date }).then(async () => {
            await refresh();
            setRemoveOpen(false);
          });
        }}
        onCancel={() => setRemoveOpen(false)}
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

/**
 * An archived template is absent from the picker unless it is this day's
 * current value, where it appears named as archived and cannot be re-picked
 * (SET-6's failure list). Hiding the row a day is actually using would leave
 * the field looking empty on a day that is planned.
 */
function templateItems(
  all: readonly TemplateSummaryView[],
  current: TemplateSummaryView | null,
): PickerListItem[] {
  return all
    .filter((template) => !template.archived || template.id === current?.id)
    .map((template) => ({
      id: template.id,
      title: template.archived
        ? COPY.archivedSuffix(displayName(template))
        : displayName(template),
      meta: metaFor(template),
      marker: mostBehind(all, template),
      disabled: template.archived,
    }));
}

function displayName(template: TemplateSummaryView): string {
  return template.name.trim() === "" ? COPY.untitled : template.name;
}

function metaFor(template: TemplateSummaryView): string {
  const parts = [COPY.itemsAndMinutes(template.itemCount, template.totalMin)];
  if (template.weeklyTarget !== null) {
    parts.push(COPY.usedOfTarget(template.usedThisWeek, template.weeklyTarget));
  }
  if (template.typicalDays.length > 0) {
    parts.push(formatWeekdays(template.typicalDays));
  }
  return parts.join(" · ");
}

/**
 * The one marker, on one row — the targeted template furthest from its target.
 * Ties go to nobody: two rows carrying "most behind" says neither.
 */
function mostBehind(
  all: readonly TemplateSummaryView[],
  template: TemplateSummaryView,
): boolean {
  const targeted = all.filter(
    (row) => row.weeklyTarget !== null && row.usedThisWeek < row.weeklyTarget,
  );
  if (targeted.length === 0) return false;

  const shortfall = (row: TemplateSummaryView) =>
    (row.weeklyTarget ?? 0) - row.usedThisWeek;

  const worst = Math.max(...targeted.map(shortfall));
  const leaders = targeted.filter((row) => shortfall(row) === worst);
  return leaders.length === 1 && leaders[0]?.id === template.id;
}

function formatWeekdays(days: readonly number[]): string {
  const initials = ["M", "T", "W", "T", "F", "S", "S"];
  return [...days]
    .sort((a, b) => a - b)
    .map((day) => initials[day] ?? "")
    .join(" ");
}

/** Icon · title · time · Fixed/Flexible (WK-02's one-off rows). */
function oneOffMeta(item: DayItemView, zone: string): string {
  const timing = item.scheduling === "hard" ? COPY.fixed : COPY.flexible;
  if (item.scheduledStart === null) return `${COPY.whenAnytime} · ${timing}`;
  return `${formatClock(item.scheduledStart, zone)} · ${timing}`;
}

/** Icon · title · time · duration (the read-only *This day* list). */
function readOnlyMeta(item: DayItemView, zone: string): string {
  const duration =
    item.durationMin === null ? null : COPY.minutes(item.durationMin);
  const clock =
    item.scheduledStart === null
      ? COPY.whenAnytime
      : formatClock(item.scheduledStart, zone);
  return duration === null ? clock : `${clock} · ${duration}`;
}
