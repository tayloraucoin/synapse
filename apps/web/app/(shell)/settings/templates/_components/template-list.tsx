"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  ArchivedSection,
  Button,
  ConfirmDialog,
  EllipsesMenu,
  EmptyState,
  ListRow,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";
import type { TemplateSummaryView } from "@syn/types";

import { TEMPLATE_COPY as COPY } from "@/components/template-editor";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";
import { settingsTemplateRoute } from "@/lib/routes";

/** TP-01 — the kinds of day that exist. */
export function TemplateList() {
  const router = useRouter();
  const online = useOnline();
  const utils = trpc.useUtils();

  const [archiveTarget, setArchiveTarget] =
    React.useState<TemplateSummaryView | null>(null);

  const list = trpc.template.list.useQuery({ includeArchived: true });
  const duplicate = trpc.template.duplicate.useMutation();
  const archive = trpc.template.archive.useMutation();
  const restore = trpc.template.restore.useMutation();
  const create = trpc.template.create.useMutation();

  if (list.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }

  const templates = list.data ?? [];
  const active = templates.filter((template) => !template.archived);
  const archived = templates.filter((template) => template.archived);

  return (
    <div className="flex flex-col gap-(--space-4)">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      {templates.length === 0 ? (
        <EmptyState
          density="page"
          text={COPY.emptyText}
          actions={[
            {
              label: COPY.newTemplate,
              onClick: () => {
                void create.mutateAsync().then((created) => {
                  router.push(settingsTemplateRoute(created.id));
                });
              },
            },
          ]}
        />
      ) : (
        <ul className="flex flex-col">
          {active.map((template) => (
            <ListRow
              key={template.id}
              as="li"
              title={template.name.trim() === "" ? COPY.untitled : template.name}
              meta={
                <span className="flex flex-wrap items-center gap-(--space-2)">
                  <span>
                    {COPY.itemsAndMinutes(template.itemCount, template.totalMin)}
                  </span>
                  {template.typicalDays.length > 0 ? (
                    <Text as="span" variant="caption" tone="secondary">
                      {formatWeekdays(template.typicalDays)}
                    </Text>
                  ) : null}
                  {template.weeklyTarget === null ? null : (
                    <Text as="span" variant="caption" tone="secondary">
                      {COPY.target(template.weeklyTarget)}
                    </Text>
                  )}
                  {template.usedThisWeek > 0 ? (
                    <Text as="span" variant="caption" tone="secondary">
                      {COPY.usedThisWeek(template.usedThisWeek)}
                    </Text>
                  ) : null}
                </span>
              }
              href={settingsTemplateRoute(template.id)}
              trailing={
                <EllipsesMenu
                  label={`More actions for ${template.name}`}
                  disabled={!online}
                  items={[
                    {
                      label: COPY.duplicate,
                      onClick: () => {
                        void duplicate
                          .mutateAsync({ id: template.id })
                          .then(async (copy) => {
                            await utils.template.list.invalidate();
                            router.push(settingsTemplateRoute(copy.id));
                          });
                      },
                    },
                    {
                      label: COPY.archive,
                      onClick: () => {
                        setArchiveTarget(template);
                      },
                    },
                  ]}
                />
              }
            />
          ))}
        </ul>
      )}

      {archived.length === 0 ? null : (
        <ArchivedSection count={archived.length}>
          <ul className="flex flex-col">
            {archived.map((template) => (
              <ListRow
                key={template.id}
                as="li"
                muted
                title={template.name.trim() === "" ? COPY.untitled : template.name}
                meta={COPY.itemsAndMinutes(template.itemCount, template.totalMin)}
                href={settingsTemplateRoute(template.id)}
                trailing={
                  <Button
                    variant="ghost"
                    disabled={!online}
                    onClick={() => {
                      void restore
                        .mutateAsync({ id: template.id })
                        .then(() => utils.template.list.invalidate());
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

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(next) => {
          if (!next) setArchiveTarget(null);
        }}
        title={COPY.archiveTitle(archiveTarget?.name ?? "")}
        description={COPY.archiveBody}
        confirmLabel={COPY.archive}
        cancelLabel={COPY.keep}
        busy={archive.isPending}
        onConfirm={() => {
          if (!archiveTarget) return;
          void archive
            .mutateAsync({ id: archiveTarget.id })
            .then(async () => {
              await utils.template.list.invalidate();
              setArchiveTarget(null);
            });
        }}
        onCancel={() => {
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}

function formatWeekdays(days: readonly number[]): string {
  const initials = ["M", "T", "W", "T", "F", "S", "S"];
  return [...days]
    .sort((a, b) => a - b)
    .map((day) => initials[day] ?? "")
    .join(" ");
}
