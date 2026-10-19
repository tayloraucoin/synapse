"use client";

import * as React from "react";
import {
  Button,
  CloseIcon,
  cn,
  DoneIcon,
  LinearStatusGlyph,
  Text,
} from "@syn/ui";
import type { StatusGroup } from "@/lib/data/item-sheet-linear";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.linear.statusList;

/**
 * StatusList — the team's whole workflow, grouped as in Linear (USE-66;
 * interactions/linear-status/states/status-sheet.md, D-USE-77, D-USE-78): ×
 * on the left, "<item> · ENG-123", "Status", "Moves it in Linear
 * (<workspace>)", then Backlog, Unstarted, Started and "Completed and
 * canceled", each status its shape in Linear's colour with its word and, on
 * the right, its consequence here; the current one shaded with a check.
 *
 * A step inside the Item sheet [judgment: the devs' call], so no second
 * sheet stacks; × goes back to the fields with nothing changed. Props only.
 */
export interface StatusListProps {
  title: string;
  identifier: string;
  workspace: string;
  groups: readonly StatusGroup[];
  currentId: string;
  onPick: (stateId: string) => void;
  onBack: () => void;
  headingRef: React.Ref<HTMLHeadingElement>;
}

export function StatusList({
  title,
  identifier,
  workspace,
  groups,
  currentId,
  onPick,
  onBack,
  headingRef,
}: StatusListProps) {
  const headingId = React.useId();
  return (
    <div className="flex flex-col">
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.back}
        onClick={onBack}
        className="-ms-(--space-3) self-start"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <Text as="p" variant="secondary" tone="secondary">
        {COPY.scope(title, identifier)}
      </Text>
      <Text
        ref={headingRef}
        as="h2"
        id={headingId}
        variant="heading"
        tabIndex={-1}
        className="outline-none"
      >
        {COPY.title}
      </Text>
      <Text as="p" variant="caption" tone="secondary">
        {COPY.lead(workspace)}
      </Text>

      <div className="flex flex-col pt-(--space-2)">
        {groups.map((group) => {
          const groupId = `${headingId}-${group.key}`;
          return (
            <section key={group.key} aria-labelledby={groupId}>
              <Text
                as="h3"
                id={groupId}
                variant="caption"
                tone="secondary"
                className="pt-(--space-3) pb-(--space-1) font-medium"
              >
                {COPY.groups[group.key]}
              </Text>
              <ul className="flex flex-col">
                {group.options.map((option) => {
                  const current = option.id === currentId;
                  const effect = COPY.effects[option.effect] ?? null;
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        aria-current={current ? "true" : undefined}
                        onClick={() => onPick(option.id)}
                        className={cn(
                          "-mx-(--space-2) flex min-h-10 w-[calc(100%+var(--space-4))] items-center gap-(--space-3) rounded-(--radius-control) px-(--space-2) text-start",
                          "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          current && "bg-surface",
                        )}
                      >
                        <LinearStatusGlyph
                          type={option.type}
                          progress={option.fill}
                          color={option.color}
                          className="size-4"
                        />
                        <Text as="span" variant="body" className="flex-1">
                          {option.name}
                        </Text>
                        {current ? (
                          <>
                            <span className="sr-only">{COPY.current}</span>
                            <DoneIcon
                              aria-hidden="true"
                              className="size-4 shrink-0"
                            />
                          </>
                        ) : effect === null ? null : (
                          <Text as="span" variant="caption" tone="secondary">
                            {effect}
                          </Text>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
