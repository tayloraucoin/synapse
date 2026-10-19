"use client";

import * as React from "react";
import {
  AddIcon,
  Button,
  cn,
  DoneIcon,
  ItemIcon,
  SearchField,
  Text,
} from "@syn/ui";
import type { ItemSheetView, SwapRow } from "@/lib/data/use-item-sheet";
import { BLOCK_HUE, HUE_CHIP } from "../block-hue";
import { ITEM_SHEET_COPY as COPY } from "./copy";

/**
 * SwapStep — Swap inside the Item sheet (USE-64; item-sheet/states/swap.md,
 * swap-empty.md; D-USE-12): the library filtered to the item's kind, each
 * row its icon, "<n> min · starts <time>", then where the block ends with
 * that pick, in fixed columns, the current one checked. One tap picks; the
 * sheet saves and closes. With nothing else of the kind there is no search,
 * and the empty line says so. Props only.
 */
export interface SwapStepProps {
  view: ItemSheetView;
  titleRef: React.Ref<HTMLHeadingElement>;
  onPick: (row: SwapRow) => void;
  /** The add sheet preset to the kind: the add ticket's; absent, Add one waits for it. */
  onAddOne?: () => void;
}

export function SwapStep({ view, titleRef, onPick, onAddOne }: SwapStepProps) {
  const { block, item, swap } = view;
  const [query, setQuery] = React.useState("");
  const others = swap.filter((row) => !row.current);
  const needle = query.trim().toLowerCase();
  const rows =
    needle === ""
      ? swap
      : swap.filter((row) => row.title.toLowerCase().includes(needle));
  const tint = HUE_CHIP[BLOCK_HUE[block.kind]];

  const addOne = (
    <Button
      variant={others.length === 0 ? "secondary" : "ghost"}
      onClick={onAddOne}
      aria-disabled={onAddOne === undefined || undefined}
      className={cn(
        "aria-disabled:opacity-40",
        others.length === 0 ? "self-start" : "justify-start px-0",
      )}
    >
      <AddIcon aria-hidden="true" className="size-4" />
      {COPY.swapStep.addOne}
    </Button>
  );

  return (
    <div className="flex flex-col gap-(--space-3)">
      <div className="flex flex-col">
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.swapStep.scope(block.name, block.startsAt, block.endsAt)}
        </Text>
        <Text
          ref={titleRef}
          as="h2"
          variant="heading"
          tabIndex={-1}
          className="outline-none"
        >
          {item.title}
        </Text>
      </div>

      {others.length === 0 ? null : (
        <SearchField
          aria-label={COPY.swapStep.search(block.kind)}
          placeholder={COPY.swapStep.search(block.kind)}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
      )}

      <ul className="flex flex-col" aria-label={COPY.swap}>
        {rows.map((row) => (
          <li key={row.id} className="border-hairline border-b">
            <button
              type="button"
              aria-current={row.current || undefined}
              onClick={() => onPick(row)}
              className={cn(
                "flex min-h-14 w-full items-center gap-(--space-3) py-(--space-2) text-start",
                "hover:bg-surface focus-visible:ring-ring outline-none focus-visible:ring-2",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius)",
                  tint,
                )}
              >
                <ItemIcon icon={row.icon} size={24} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <Text
                  as="span"
                  variant="body"
                  weight={500}
                  className="truncate"
                >
                  {row.title}
                </Text>
                <Text as="span" variant="secondary" tone="secondary">
                  {COPY.swapStep.line(row.lengthMin, row.startsAt)}
                </Text>
              </span>
              <Text
                as="span"
                variant="secondary"
                tone="secondary"
                className="w-20 shrink-0 text-end"
              >
                {COPY.ends(row.endsAt)}
              </Text>
              <span className="flex w-6 shrink-0 justify-center">
                {row.current ? (
                  <>
                    <DoneIcon aria-hidden="true" className="size-4" />
                    <span className="sr-only">{COPY.swapStep.current}</span>
                  </>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {needle !== "" && rows.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.swapStep.noMatch(query.trim())}
        </Text>
      ) : null}

      {others.length === 0 ? (
        <div className="flex flex-col gap-(--space-2)">
          <Text as="p" variant="body" weight={600}>
            {COPY.swapStep.empty}
          </Text>
          <Text as="p" variant="secondary" tone="secondary">
            {COPY.swapStep.emptyLine(block.kind)}
          </Text>
          {addOne}
        </div>
      ) : (
        addOne
      )}
    </div>
  );
}
