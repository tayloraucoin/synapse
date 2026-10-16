"use client";

import * as React from "react";
import {
  AddIcon,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  FromPoolIcon,
  HueSquare,
  OpenInLinearIcon,
  ReorderIcon,
  SortableHandle,
  SortableList,
  Text,
  type LucideIcon,
  type SquareHue,
} from "@syn/ui";
import type { WorkTier } from "@syn/utils";

/**
 * WorkTierSections — a This week Work block in Block view's editing
 * (USE-50; block-view/states/work-tiers.md, work-add-to-a-tier.md,
 * D-USE-31): the fit line in words, then the four tiers, each a heading with
 * its colour square beside its word (colour never alone), its rows and its
 * add row. Urgent keeps its add row when empty. A row is the title (a button
 * to the Item sheet), a Linear item's ID and size under it, the range
 * trailing, then the grip at the trailing edge (D-USE-86); no checkboxes, no
 * rail times. A tier's add row, pressed, takes a muted fill and opens the
 * dropdown titled with the tier (D-USE-28, D-USE-41): New item, From the
 * pool, From Linear, each with its muted line. Reorder is within a tier
 * [the dev's call: across tiers is the Item sheet's Move to]. The words and
 * the writes are the caller's. Props only.
 */

export interface WorkTierRowModel {
  id: string;
  title: string;
  meta: string | null;
  range: string | null;
}

export interface WorkTierSectionModel<R extends WorkTierRowModel> {
  tier: WorkTier;
  word: string;
  hue: SquareHue;
  rows: readonly R[];
}

export type WorkTierAddChoice = "new" | "pool" | "linear";

export interface WorkTierSectionsProps<R extends WorkTierRowModel> {
  /** In ink, never red, never a count. */
  fitLine: string;
  tiers: readonly WorkTierSectionModel<R>[];
  words: {
    addTo: (tier: WorkTier) => string;
    choices: Record<WorkTierAddChoice, { label: string; line: string }>;
    reorder: (title: string) => string;
    rowName: (row: R) => string;
  };
  onRow: (row: R) => void;
  onReorder: (tier: WorkTier, ids: string[]) => void;
  onAdd: (tier: WorkTier, choice: WorkTierAddChoice) => void;
  /** Around a row's body: the swipe and the long-press menu. */
  wrapRow?: (row: R, body: React.ReactNode) => React.ReactNode;
  /** The tier whose add menu is open on load (`?state=work-add-to-a-tier`). */
  openTier?: WorkTier | null;
}

const CHOICE_ICON: Record<WorkTierAddChoice, LucideIcon> = {
  new: AddIcon,
  pool: FromPoolIcon,
  linear: OpenInLinearIcon,
};

const CHOICES: readonly WorkTierAddChoice[] = ["new", "pool", "linear"];

function TierAdd({
  label,
  choices,
  defaultOpen,
  onChoose,
}: {
  label: string;
  choices: WorkTierSectionsProps<WorkTierRowModel>["words"]["choices"];
  defaultOpen: boolean;
  onChoose: (choice: WorkTierAddChoice) => void;
}) {
  const [open, setOpen] = React.useState(false);
  // Seeded after mount, so the server and the first paint agree.
  React.useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        data-tier-add
        className={cn(
          "text-text-muted flex min-h-11 w-full items-center gap-(--space-3) rounded-(--radius-control) px-(--space-1) text-start text-(length:--fs-body) outline-none",
          "focus-visible:ring-ring focus-visible:ring-2",
          // Pressed: a muted fill, full width (work-add-to-a-tier.md).
          open && "bg-fill-muted",
        )}
      >
        <AddIcon aria-hidden="true" className="size-4 shrink-0" />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className={cn(
          "w-(--radix-dropdown-menu-trigger-width) max-w-80 rounded-(--radius-sheet) bg-background p-0 py-(--space-1) shadow-menu",
          "motion-reduce:animate-none",
        )}
      >
        <DropdownMenuLabel className="px-(--space-4) pt-(--space-2) pb-(--space-1) text-(length:--fs-caption) font-medium text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        {CHOICES.map((choice) => {
          const Icon = CHOICE_ICON[choice];
          return (
            <DropdownMenuItem
              key={choice}
              onSelect={() => onChoose(choice)}
              className="min-h-(--target) items-start gap-(--space-3) px-(--space-4) py-(--space-2) text-(length:--fs-body) text-foreground"
            >
              <Icon
                aria-hidden="true"
                className="mt-0.5 size-4 text-muted-foreground"
              />
              <span className="flex flex-col gap-(--space-1)">
                {choices[choice].label}
                <span className="text-(length:--fs-caption) leading-(--lh-caption) text-muted-foreground">
                  {choices[choice].line}
                </span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WorkTierSections<R extends WorkTierRowModel>({
  fitLine,
  tiers,
  words,
  onRow,
  onReorder,
  onAdd,
  wrapRow,
  openTier = null,
}: WorkTierSectionsProps<R>) {
  return (
    <div data-work-tiers className="flex flex-col">
      <Text as="p" variant="caption" tone="muted" className="py-(--space-3)">
        {fitLine}
      </Text>
      {tiers.map((tier) => {
        const headId = `tier-${tier.tier}`;
        return (
          <section
            key={tier.tier}
            aria-labelledby={headId}
            data-tier={tier.tier}
            className="flex flex-col pb-(--space-3)"
          >
            <h2
              id={headId}
              className="flex h-8 items-center gap-(--space-2) text-(length:--fs-caption) leading-(--lh-caption) font-semibold text-foreground"
            >
              <HueSquare hue={tier.hue} />
              {tier.word}
            </h2>
            {tier.rows.length > 0 ? (
              <SortableList
                items={tier.rows}
                label={tier.word}
                onReorder={(ids) => onReorder(tier.tier, ids)}
                itemClassName="block border-0 data-lifted:opacity-100"
                renderItem={(row, { handleProps, isLifted }) => {
                  const body = (
                    <div className="flex min-h-(--row-min) items-center gap-(--space-3)">
                      <button
                        type="button"
                        data-row-open
                        aria-label={words.rowName(row)}
                        onClick={() => onRow(row)}
                        className="flex min-w-0 flex-1 flex-col items-start rounded-(--radius-control) py-(--space-2) text-start outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="max-w-full truncate text-(length:--fs-body) text-foreground">
                          {row.title}
                        </span>
                        {row.meta ? (
                          <span className="text-text-muted max-w-full truncate text-(length:--fs-caption) leading-(--lh-caption)">
                            {row.meta}
                          </span>
                        ) : null}
                      </button>
                      {row.range ? (
                        <span className="text-text-muted shrink-0 text-(length:--fs-caption) leading-(--lh-caption) tabular-nums">
                          {row.range}
                        </span>
                      ) : null}
                      <span data-grip className="flex shrink-0">
                        <SortableHandle
                          {...handleProps}
                          aria-label={words.reorder(row.title)}
                          className={cn(
                            handleProps.className,
                            "text-text-muted rounded-(--radius-control)",
                          )}
                        >
                          <ReorderIcon aria-hidden="true" className="size-4" />
                        </SortableHandle>
                      </span>
                    </div>
                  );
                  return (
                    <div
                      data-work-row={row.id}
                      className={cn(
                        "bg-background border-b border-hairline",
                        isLifted &&
                          "border-ink bg-surface rounded-(--radius-control) border px-(--space-3)",
                      )}
                    >
                      {wrapRow ? wrapRow(row, body) : body}
                    </div>
                  );
                }}
              />
            ) : null}
            <TierAdd
              label={words.addTo(tier.tier)}
              choices={words.choices}
              defaultOpen={openTier === tier.tier}
              onChoose={(choice) => onAdd(tier.tier, choice)}
            />
          </section>
        );
      })}
    </div>
  );
}
