"use client";

import Image from "next/image";
import * as React from "react";

import { Card, EllipsesMenu, SortableHandle, Tag, Text, type SortableHandleProps } from "@syn/ui";
import type { PassageView } from "@syn/types";

import { assetRoute } from "@/lib/routes";

import { PASSAGES_COPY as COPY } from "./copy";
import { excerptOf, firstLineOf } from "./excerpt";

/**
 * One passage as a card — UX v1.2 §4.6 (RUN-9): the handle, the title (or the
 * first line of the body, plain), a two-line serif excerpt, the first image
 * as a 44px thumbnail, the tag chips, and the menu (*Edit · Archive*).
 *
 * THE EXCERPT IS DECORATIVE: the Markdown stripped to text and clamped to two
 * lines. The body itself is only ever rendered through the editor's
 * read-only mode — on the frame — never here as HTML.
 */
export function PassageCard({
  passage,
  handleProps,
  isLifted,
  onEdit,
  onArchive,
}: {
  passage: PassageView;
  handleProps: SortableHandleProps;
  isLifted: boolean;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const name = passage.title ?? firstLineOf(passage.bodyMd) ?? COPY.untitled;
  const excerpt = excerptOf(passage.bodyMd);
  const thumbnail = passage.images[0] ?? null;

  return (
    <Card className={"flex-1 flex-row items-start gap-(--space-2) p-(--space-2)" + (isLifted ? " bg-paper" : "")}>
      <SortableHandle {...handleProps} />
      {thumbnail === null ? null : (
        // Unoptimised: the read route is session-gated, and a thumbnail is 44px.
        <Image
          src={assetRoute(thumbnail)}
          alt=""
          width={44}
          height={44}
          unoptimized
          className="border-hairline size-(--target) shrink-0 rounded-(--radius) border object-cover"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
        {/*
         * T6.1 (DAY-2): the title's line is the 44px row the handle, the
         * thumbnail and the menu sit on, so all four share one centre however
         * many lines the excerpt and the tags add beneath.
         */}
        <span className="flex min-h-(--target) min-w-0 items-center">
          <Text as="span" variant="row-title" weight={500} truncate>
            {name || COPY.untitled}
          </Text>
        </span>
        {excerpt === "" ? null : (
          <p className="tabular-off text-text-secondary m-0 line-clamp-2 font-serif text-(length:--fs-secondary) leading-(--lh-secondary)">
            {excerpt}
          </p>
        )}
        {passage.tags.length === 0 ? null : (
          <span className="flex flex-wrap gap-(--space-2)">
            {passage.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </span>
        )}
      </div>
      <EllipsesMenu
        label={name || COPY.untitled}
        items={[
          { label: COPY.edit, onClick: onEdit },
          { label: COPY.archive, onClick: onArchive },
        ]}
      />
    </Card>
  );
}
