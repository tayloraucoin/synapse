"use client";

import * as React from "react";

import {
  EllipsesMenu,
  EmptyState,
  ListRow,
  SkeletonRow,
  StatusLine,
} from "@syn/ui";

import {
  CATEGORY_COPY as COPY,
  CategorySheet,
  DeleteCategoryDialog,
} from "@/components/category-sheet";
import { useOnline } from "@/lib/hooks/use-online";
import { useSheet } from "@/lib/hooks/use-sheet";
import { trpc } from "@/lib/trpc/client";

/**
 * CT-01 — the category list.
 *
 * A category is one of the four things this product deletes (cross-cutting
 * §8.4), and it is safe to delete precisely because it carries no mechanic:
 * removing one unassigns habits and changes nothing about how a day runs. The
 * dialog says exactly that, and the foreign key makes it true.
 */
export function CategoryList() {
  const online = useOnline();
  const utils = trpc.useUtils();
  const sheet = useSheet("category");

  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    name: string;
    habitCount: number;
  } | null>(null);

  const list = trpc.category.list.useQuery();
  const remove = trpc.category.delete.useMutation();

  if (list.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }

  const categories = list.data ?? [];

  return (
    <div className="flex flex-col gap-(--space-4)">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      {categories.length === 0 ? (
        <EmptyState
          density="page"
          text={COPY.emptyText}
          actions={[
            {
              label: COPY.emptyAction,
              onClick: () => {
                sheet.openWith();
              },
            },
          ]}
        />
      ) : (
        <ul className="flex flex-col">
          {categories.map((category) => (
            <ListRow
              key={category.id}
              as="li"
              leading={
                <span
                  className={`inline-block size-4 rounded-full bg-cat-${category.key}-500`}
                >
                  <span className="sr-only">{category.key}</span>
                </span>
              }
              title={category.name}
              meta={COPY.habitCount(category.habitCount)}
              onClick={() => {
                sheet.openWith(category.id);
              }}
              trailing={
                <EllipsesMenu
                  label={`More actions for ${category.name}`}
                  disabled={!online}
                  items={[
                    {
                      label: COPY.delete,
                      onClick: () => {
                        setDeleteTarget({
                          id: category.id,
                          name: category.name,
                          habitCount: category.habitCount,
                        });
                      },
                    },
                  ]}
                />
              }
            />
          ))}
        </ul>
      )}

      <CategorySheet
        open={sheet.open}
        categoryId={sheet.id ?? undefined}
        onOpenChange={(next) => {
          if (!next) sheet.close();
        }}
      />

      <DeleteCategoryDialog
        open={deleteTarget !== null}
        name={deleteTarget?.name ?? ""}
        habitCount={deleteTarget?.habitCount ?? 0}
        busy={remove.isPending}
        onCancel={() => {
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          void remove.mutateAsync({ id: deleteTarget.id }).then(async () => {
            await utils.category.list.invalidate();
            await utils.habit.list.invalidate();
            setDeleteTarget(null);
          });
        }}
      />
    </div>
  );
}
