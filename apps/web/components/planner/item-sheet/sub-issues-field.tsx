"use client";

import * as React from "react";
import {
  Checkbox,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MoreIcon,
  MoveToIcon,
  Text,
} from "@syn/ui";
import { shortDate } from "@/components/work/add/new-task/form";
import type { SubIssueView } from "@/lib/data/item-sheet-sessions";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.subIssues;

/**
 * SubIssuesField — a linked issue's sub-issues in its sheet (USE-67;
 * tier-and-sessions.md, sub-issue-alone.md, D-USE-51 (6)): a checkbox each,
 * checked when done in Linear; one placed on a day by itself shows its day
 * muted ("Thu 15"), and every open one has ··· with "Place on a day by
 * itself" (a placed one's moves it). Checking writes Linear's check; the
 * box shows the change at once and the snapshot follows. Props only.
 */
export interface SubIssuesFieldProps {
  subIssues: readonly SubIssueView[];
  onCheck: (sub: SubIssueView, done: boolean) => void;
  onPlace: (sub: SubIssueView, trigger: HTMLElement | null) => void;
}

export function SubIssuesField({
  subIssues,
  onCheck,
  onPlace,
}: SubIssuesFieldProps) {
  return (
    <div className="border-hairline flex flex-col border-t pt-(--space-3)">
      <Text as="h3" variant="body" className="text-foreground">
        {COPY.label}
      </Text>
      <ul className="flex flex-col">
        {subIssues.map((sub) => (
          <SubIssueLine
            key={sub.issueId}
            sub={sub}
            onCheck={(done) => onCheck(sub, done)}
            onPlace={(trigger) => onPlace(sub, trigger)}
          />
        ))}
      </ul>
    </div>
  );
}

function SubIssueLine({
  sub,
  onCheck,
  onPlace,
}: {
  sub: SubIssueView;
  onCheck: (done: boolean) => void;
  onPlace: (trigger: HTMLElement | null) => void;
}) {
  const id = React.useId();
  const moreRef = React.useRef<HTMLButtonElement>(null);
  // Shown at once; the snapshot's state reads back over it.
  const [done, setDone] = React.useState(sub.done);
  React.useEffect(() => setDone(sub.done), [sub.done]);
  const day = sub.placed ? shortDate(sub.placed.dateKey) : null;

  return (
    <li className="flex min-h-(--target) items-center gap-(--space-3)">
      <Checkbox
        id={id}
        checked={done}
        aria-describedby={day === null ? undefined : `${id}-day`}
        onCheckedChange={(next) => {
          const value = next === true;
          setDone(value);
          onCheck(value);
        }}
      />
      <label
        htmlFor={id}
        className="text-(length:--fs-body) min-w-0 flex-1 cursor-pointer"
      >
        <span className={done ? "text-muted-foreground" : "text-foreground"}>
          {sub.title}
        </span>
      </label>
      {day === null ? null : (
        <Text as="span" id={`${id}-day`} variant="caption" tone="secondary">
          {day}
        </Text>
      )}
      {done ? null : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            ref={moreRef}
            aria-label={COPY.more(sub.title)}
            className={cn(
              "text-foreground -me-(--space-3) inline-flex size-(--target) shrink-0 items-center justify-center rounded-full outline-none",
              "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2",
            )}
          >
            <MoreIcon aria-hidden="true" className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            className="bg-background shadow-menu w-60 rounded-(--radius-sheet) p-0 py-(--space-1) motion-reduce:animate-none"
          >
            <DropdownMenuItem
              className="text-foreground min-h-(--target) gap-(--space-3) px-(--space-4) text-(length:--fs-body)"
              onSelect={() => onPlace(moreRef.current)}
            >
              <MoveToIcon
                aria-hidden="true"
                className="text-muted-foreground size-4"
              />
              {sub.placed ? COPY.placeAgain : COPY.place}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}
