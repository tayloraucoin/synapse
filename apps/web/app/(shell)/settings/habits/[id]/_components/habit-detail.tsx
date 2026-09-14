"use client";

import {
  GroupHeading,
  ListRow,
  SkeletonRow,
  Tag,
  Text,
} from "@syn/ui";

import { CategorySheet } from "@/components/category-sheet";
import { HabitSheet } from "@/components/habit-sheet";
import { useSheet } from "@/lib/hooks/use-sheet";
import { trpc } from "@/lib/trpc/client";
import { settingsYourDayBlockRoute } from "@/lib/routes";

import { HABIT_DETAIL_COPY as COPY } from "../../_components/copy";

/**
 * LB-03 — where a habit is used.
 *
 * "So archiving or changing it isn't a surprise" (Epic 1 LB-03). Until SET-5
 * there are no templates and until SET-6 there are no days, so *In templates*
 * shows its empty sentence and *Recent days* renders nothing at all — the
 * document gives no empty state for that section, and inventing one would be
 * putting words in a screen the document deliberately left quiet.
 *
 * THE SHEET OPENS OVER THIS SCREEN, not beside it: arriving from LB-01 carries
 * `?sheet=habit`, so a person editing sees usage one tap away and the URL is
 * the habit's.
 */
export function HabitDetail({ habitId }: { habitId: string }) {
  const sheet = useSheet("habit");
  const categorySheet = useSheet("category");
  const usage = trpc.habit.usage.useQuery({ id: habitId });

  return (
    <div className="flex flex-col gap-(--space-5)">
      <section className="flex flex-col gap-(--space-2)">
        <GroupHeading>{COPY.inTemplates}</GroupHeading>

        {usage.isLoading ? (
          <SkeletonRow />
        ) : usage.data && usage.data.templates.length > 0 ? (
          <ul className="flex flex-col">
            {usage.data.templates.map((row, index) => (
              <ListRow
                key={`${row.templateId}-${index}`}
                as="li"
                title={row.templateName}
                meta={`${COPY.slot(row.durationMin)} · ${COPY.priority(row.priority)}`}
                tag={row.overridden ? COPY.overridden : undefined}
                href={settingsYourDayBlockRoute(row.kind, row.templateId)}
              />
            ))}
          </ul>
        ) : (
          <Text as="p" tone="secondary">
            {COPY.noTemplates}
          </Text>
        )}
      </section>

      {/* No empty state: the document gives none, so the section is absent. */}
      {usage.data && usage.data.recentDays.length > 0 ? (
        <section className="flex flex-col gap-(--space-2)">
          <GroupHeading>{COPY.recentDays}</GroupHeading>
          <ul className="flex flex-col">
            {usage.data.recentDays.map((day) => (
              <ListRow
                key={day.date}
                as="li"
                title={day.date}
                trailing={<Tag>{day.outcome}</Tag>}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <HabitSheet
        open={sheet.open}
        mode="edit"
        habitId={sheet.id ?? habitId}
        onOpenChange={(next) => {
          if (!next) sheet.close();
        }}
        onCreateCategory={() => {
          categorySheet.openWith();
        }}
      />

      <CategorySheet
        open={categorySheet.open}
        categoryId={categorySheet.id ?? undefined}
        onOpenChange={(next) => {
          if (!next) categorySheet.close();
        }}
      />
    </div>
  );
}
