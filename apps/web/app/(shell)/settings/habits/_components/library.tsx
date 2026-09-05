"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  ArchivedSection,
  Button,
  ConfirmDialog,
  EllipsesMenu,
  EmptyState,
  GroupHeading,
  ItemIcon,
  ListRow,
  RegionRetry,
  SearchField,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";
import type { HabitSummaryView, ItemType } from "@syn/types";

import { CategorySheet } from "@/components/category-sheet";
import { HabitSheet } from "@/components/habit-sheet";
import { StarterSetChooser } from "@/components/starter-set";
import { iconImageUrl } from "@/lib/assets/icon-url";
import { useOnline } from "@/lib/hooks/use-online";
import { useSheet } from "@/lib/hooks/use-sheet";
import { trpc } from "@/lib/trpc/client";
import { settingsHabitRoute } from "@/lib/routes";

import { LIBRARY_COPY as COPY } from "./copy";

/**
 * LB-01 — the habit library.
 *
 * THE GROUPS ARE A FIXED ORDER AND ONLY RENDER WHEN NON-EMPTY (Epic 1 LB-01):
 * a heading over nothing is a promise the screen does not keep.
 *
 * THE SHEET IS URL STATE, so back closes it before it leaves the screen and a
 * link into a habit is shareable. `?sheet=habit&id=…` — SYS-1's `useSheet`.
 */

const GROUPS: ReadonlyArray<{ type: ItemType; heading: string }> = [
  { type: "habit", heading: COPY.groupHabits },
  { type: "task_appointment", heading: COPY.groupTasks },
  { type: "deep_work", heading: COPY.groupDeepWork },
];

export function Library() {
  const router = useRouter();
  const online = useOnline();
  const utils = trpc.useUtils();

  const sheet = useSheet("habit");
  const categorySheet = useSheet("category");

  const [query, setQuery] = React.useState("");
  const [starterOpen, setStarterOpen] = React.useState(false);
  const [archiveTarget, setArchiveTarget] =
    React.useState<HabitSummaryView | null>(null);

  const list = trpc.habit.list.useQuery({ includeArchived: true });
  const archive = trpc.habit.archive.useMutation();
  const restore = trpc.habit.restore.useMutation();
  const duplicate = trpc.habit.duplicate.useMutation();

  const templateCount = trpc.habit.templateCount.useQuery(
    { id: archiveTarget?.id ?? "" },
    { enabled: archiveTarget !== null },
  );

  const habits = list.data?.habits ?? [];
  const active = habits.filter((habit) => !habit.archived);
  const archived = habits.filter((habit) => habit.archived);

  const filtered = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed === "") return active;
    return active.filter(
      (habit) =>
        habit.title.toLowerCase().includes(trimmed) ||
        (habit.category?.name.toLowerCase().includes(trimmed) ?? false),
    );
  }, [active, query]);

  if (list.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }

  if (list.isError) {
    return (
      <RegionRetry
        label={COPY.loadError}
        onRetry={() => void list.refetch()}
      />
    );
  }

  const searching = query.trim() !== "";
  const nothingAtAll = active.length === 0 && archived.length === 0;

  return (
    <div className="flex flex-col gap-(--space-4)">
      {!online ? (
        <StatusLine variant="offline" placement="inline" />
      ) : null}

      {nothingAtAll ? (
        <>
          <EmptyState
            density="page"
            text={COPY.emptyText}
            actions={[
              {
                label: COPY.emptyAddHabit,
                onClick: () => {
                  sheet.openWith();
                },
              },
              {
                label: COPY.emptyStarterSet,
                onClick: () => {
                  setStarterOpen(true);
                },
                emphasis: "secondary",
              },
            ]}
          />
          {starterOpen ? (
            <StarterSetChooser
              existingTitles={habits.map((habit) => habit.title)}
              onClose={() => {
                setStarterOpen(false);
              }}
            />
          ) : null}
        </>
      ) : (
        <>
          <SearchField
            aria-label={COPY.searchLabel}
            label={COPY.searchLabel}
            placeholder={COPY.searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            onClear={() => {
              setQuery("");
            }}
          />

          {searching && filtered.length === 0 ? (
            <Text as="p" tone="secondary" aria-live="polite">
              {COPY.noMatches(query.trim())}
            </Text>
          ) : (
            GROUPS.map((group) => {
              const rows = filtered.filter((habit) => habit.type === group.type);
              if (rows.length === 0) return null;

              return (
                <section key={group.type} className="flex flex-col gap-(--space-2)">
                  <GroupHeading>{group.heading}</GroupHeading>
                  <ul className="flex flex-col">
                    {rows.map((habit) => (
                      <ListRow
                        key={habit.id}
                        as="li"
                        leading={
                          <ItemIcon
                            icon={habit.icon}
                            size={24}
                            imageUrl={iconImageUrl(habit.icon)}
                          />
                        }
                        title={habit.title}
                        chip={
                          habit.category
                            ? {
                                key: habit.category.key,
                                name: habit.category.name,
                              }
                            : undefined
                        }
                        meta={describeHabit(habit)}
                        tag={habit.isWakeAnchor ? COPY.wakeUpTag : undefined}
                        href={settingsHabitRoute(habit.id)}
                        trailing={
                          <EllipsesMenu
                            label={COPY.rowMenuLabel(habit.title)}
                            disabled={!online}
                            items={[
                              {
                                label: COPY.duplicate,
                                onClick: () => {
                                  void duplicate
                                    .mutateAsync({ id: habit.id })
                                    .then(async (copy) => {
                                      await utils.habit.list.invalidate();
                                      sheet.openWith(copy.id);
                                    });
                                },
                              },
                              {
                                label: COPY.archive,
                                onClick: () => {
                                  setArchiveTarget(habit);
                                },
                              },
                            ]}
                          />
                        }
                      />
                    ))}
                  </ul>
                </section>
              );
            })
          )}

          {archived.length === 0 ? null : (
            <ArchivedSection count={archived.length}>
              <ul className="flex flex-col">
                {archived.map((habit) => (
                  <ListRow
                    key={habit.id}
                    as="li"
                    muted
                    leading={
                      <ItemIcon
                        icon={habit.icon}
                        size={24}
                        imageUrl={iconImageUrl(habit.icon)}
                      />
                    }
                    title={habit.title}
                    meta={describeHabit(habit)}
                    onClick={() => {
                      sheet.openWith(habit.id);
                    }}
                    trailing={
                      <Button
                        variant="ghost"
                        disabled={!online}
                        onClick={() => {
                          void restore
                            .mutateAsync({ id: habit.id })
                            .then(() => utils.habit.list.invalidate());
                        }}
                      >
                        {COPY.restore}
                      </Button>
                    }
                  />
                ))}
              </ul>
            </ArchivedSection>
          )}
        </>
      )}

      <HabitSheet
        open={sheet.open}
        mode={sheet.id ? "edit" : "create"}
        habitId={sheet.id ?? undefined}
        onOpenChange={(next) => {
          if (!next) sheet.close();
        }}
        onCreateCategory={() => {
          categorySheet.openWith();
        }}
        onRestore={() => {
          if (!sheet.id) return;
          void restore.mutateAsync({ id: sheet.id }).then(async () => {
            await utils.habit.list.invalidate();
            sheet.close();
          });
        }}
      />

      <CategorySheet
        open={categorySheet.open}
        categoryId={categorySheet.id ?? undefined}
        onOpenChange={(next) => {
          if (!next) categorySheet.close();
        }}
      />

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(next) => {
          if (!next) setArchiveTarget(null);
        }}
        title={COPY.archiveTitle(archiveTarget?.title ?? "")}
        description={COPY.archiveBody(
          templateCount.data ?? 0,
          archiveTarget?.isWakeAnchor ?? false,
        )}
        confirmLabel={COPY.archive}
        cancelLabel={COPY.keep}
        busy={archive.isPending}
        onConfirm={() => {
          if (!archiveTarget) return;
          void archive
            .mutateAsync({ id: archiveTarget.id })
            .then(async () => {
              await utils.habit.list.invalidate();
              setArchiveTarget(null);
              router.refresh();
            });
        }}
        onCancel={() => {
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}

/** "10–20 min · importance 6" — the range segment is dropped when unset. */
function describeHabit(habit: HabitSummaryView): string {
  const parts: string[] = [];
  if (habit.durationMin !== null && habit.durationMax !== null) {
    parts.push(COPY.range(habit.durationMin, habit.durationMax));
  }
  parts.push(COPY.importance(habit.lifePriority));
  return parts.join(" · ");
}
