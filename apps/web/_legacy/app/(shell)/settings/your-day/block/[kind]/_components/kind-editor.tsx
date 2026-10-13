"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  ArchivedSection,
  BLOCK_KIND_WORDS,
  Button,
  ConfirmDialog,
  EllipsesMenu,
  EmptyState,
  ListRow,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";
import type { BlockKind, TemplateSummaryView } from "@syn/types";

import { BlockEditor } from "@/components/block-editor";
import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";
import { settingsYourDayBlockRoute, settingsYourDayRoute } from "@/lib/routes";

import { YOUR_DAY_COPY as COPY } from "../../../_components/copy";

/**
 * `/settings/your-day/block/{kind}` — UX v1.1 §4.14: "the block-kind rows …
 * open the block editor (§3.11) for that kind, with the template list above
 * it when more than one exists."
 *
 * THREE SHAPES, ONE RULE. With one template of the kind the editor opens on
 * it; with more than one the list is drawn and the chosen one (`?t=`) opens
 * the editor; with none, *New* creates one (`template.create({ kind })`) and
 * opens it. The list is TP-01's, kept: duplicate, archive with the one
 * confirm, archived collapsed at the bottom.
 */
export function KindEditor({ kind }: { kind: BlockKind }) {
  const router = useRouter();
  const online = useOnline();
  const utils = trpc.useUtils();
  const search = useSearchParams();
  const chosen = search.get("t");

  const list = trpc.template.list.useQuery({ includeArchived: true, kind });
  const create = trpc.template.create.useMutation();
  const duplicate = trpc.template.duplicate.useMutation();
  const archive = trpc.template.archive.useMutation();
  const restore = trpc.template.restore.useMutation();
  const [archiveTarget, setArchiveTarget] = React.useState<TemplateSummaryView | null>(null);

  const word = BLOCK_KIND_WORDS[kind];
  const templates = React.useMemo(() => list.data ?? [], [list.data]);
  const active = templates.filter((template) => !template.archived);
  const archived = templates.filter((template) => template.archived);

  const open = (id: string) => {
    router.push(settingsYourDayBlockRoute(kind, id));
  };

  const createOne = () => {
    void create.mutateAsync({ kind }).then(async (created) => {
      await utils.template.list.invalidate();
      open(created.id);
    });
  };

  // One template and nothing chosen: the editor opens on it directly.
  const only = active.length === 1 && chosen === null ? active[0] : null;
  const editingId = chosen ?? only?.id ?? null;

  if (editingId !== null) {
    // Back from the editor: the list when there is one to show, else Your day.
    const exitHref =
      active.length > 1 || archived.length > 0 ? settingsYourDayBlockRoute(kind) : settingsYourDayRoute();
    return <BlockEditor templateId={editingId} exitHref={exitHref} />;
  }

  return (
    <PageFrame
      header={
        <ShellPageHeader
          title={word}
          showBack
          backFallback={settingsYourDayRoute()}
          action={online ? { label: COPY.new, onClick: createOne, busy: create.isPending } : undefined}
        />
      }
    >
      {list.isLoading ? (
        <div className="flex flex-col gap-(--space-2)">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-(--space-4)">
          {!online ? <StatusLine variant="offline" placement="inline" /> : null}

          {active.length === 0 ? (
            <EmptyState
              density="page"
              text={COPY.kindEmpty(word)}
              actions={online ? [{ label: COPY.new, onClick: createOne }] : []}
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
                      <span>{COPY.itemsAndMinutes(template.itemCount, template.totalMin)}</span>
                      {template.usedThisWeek > 0 ? (
                        <Text as="span" variant="caption" tone="secondary">
                          {COPY.usedThisWeek(template.usedThisWeek)}
                        </Text>
                      ) : null}
                      {/* UX v1.2 §4.16 (RUN-12): the day plans that reference this list. */}
                      {template.usedBy.length > 0 ? (
                        <Text as="span" variant="caption" tone="secondary">
                          {COPY.usedBy(template.usedBy.map((plan) => plan.name))}
                        </Text>
                      ) : null}
                    </span>
                  }
                  href={settingsYourDayBlockRoute(kind, template.id)}
                  trailing={
                    <EllipsesMenu
                      label={`More actions for ${template.name}`}
                      disabled={!online}
                      items={[
                        {
                          label: COPY.duplicate,
                          onClick: () => {
                            void duplicate.mutateAsync({ id: template.id }).then(async (copy) => {
                              await utils.template.list.invalidate();
                              open(copy.id);
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
                    href={settingsYourDayBlockRoute(kind, template.id)}
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
              void archive.mutateAsync({ id: archiveTarget.id }).then(async () => {
                await utils.template.list.invalidate();
                setArchiveTarget(null);
              });
            }}
            onCancel={() => {
              setArchiveTarget(null);
            }}
          />
        </div>
      )}
    </PageFrame>
  );
}
