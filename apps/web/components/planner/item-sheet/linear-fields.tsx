"use client";

import * as React from "react";
import { Avatar, Button, cn, Text, Textarea } from "@syn/ui";
import { ITEM_SHEET_COPY } from "./copy";
import { PriorityMenu } from "./priority-menu";

const COPY = ITEM_SHEET_COPY.linear;

/**
 * LinearFields — a linked item's rows under Tier (USE-66; linear-linked.md,
 * D-USE-36, D-USE-113): Priority (its mark with its word, a pull-down that
 * writes to Linear), Assignee (shown, never written) and Description, the
 * issue's own text as the item's notes, "Synced with Linear", three lines
 * then Show all. Description edits in place as plain text with its markdown
 * kept, sent on blur. Props only.
 */
export interface LinearFieldsProps {
  priority: number;
  onPriority: (priority: number) => void;
  priorityOpen?: boolean;
  /** The assignee's name; null when the issue is not Taylor's. */
  assignee: string | null;
  assigneePhoto?: string | null;
  description: string;
  onDescription: (description: string) => void;
}

const ROW =
  "border-hairline flex flex-col gap-(--space-2) border-t py-(--space-3)";

/** Three lines' worth, roughly, before Show all is worth offering [ASSUMPTION]. */
function isLong(text: string): boolean {
  return text.length > 120 || text.split("\n").length > 3;
}

export function LinearFields({
  priority,
  onPriority,
  priorityOpen,
  assignee,
  assigneePhoto = null,
  description,
  onDescription,
}: LinearFieldsProps) {
  const labelId = React.useId();
  // What shows while a change saves: the issue's text once it reads it back.
  const [text, setText] = React.useState(description);
  React.useEffect(() => setText(description), [description]);
  const [all, setAll] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const textId = React.useId();
  const long = isLong(text);

  return (
    <>
      <PriorityMenu
        value={priority}
        onChange={onPriority}
        defaultOpen={priorityOpen}
      />

      <div className="border-hairline flex min-h-14 items-center gap-(--space-2) border-t">
        <Text as="span" variant="body" className="flex-1">
          {COPY.assignee}
        </Text>
        {assignee === null ? (
          <Text as="span" variant="body" tone="secondary">
            {COPY.unassigned}
          </Text>
        ) : (
          <>
            <Avatar name={assignee} src={assigneePhoto} size={28} decorative />
            <Text as="span" variant="body">
              {assignee}
            </Text>
          </>
        )}
      </div>

      <div className={ROW}>
        <div className="flex items-baseline justify-between gap-(--space-3)">
          <Text as="span" id={labelId} variant="body">
            {COPY.description}
          </Text>
          <Text as="span" variant="caption" tone="secondary">
            {COPY.synced}
          </Text>
        </div>
        <div className="border-border flex flex-col rounded-(--radius-control) border px-(--space-3) py-(--space-2)">
          {editing ? (
            <Textarea
              aria-labelledby={labelId}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onBlur={() => {
                setEditing(false);
                if (text !== description) onDescription(text);
              }}
              autoFocus
              autoGrow
              rows={3}
              variant="plain"
              classes={{ textarea: "border-0 p-0" }}
            />
          ) : (
            <button
              type="button"
              aria-labelledby={labelId}
              aria-describedby={textId}
              onClick={() => setEditing(true)}
              className="focus-visible:ring-ring rounded-(--radius-control) text-start focus-visible:ring-2 focus-visible:outline-none"
            >
              <Text
                as="span"
                id={textId}
                variant="body"
                className={cn(
                  "block whitespace-pre-wrap",
                  !all && "line-clamp-3",
                )}
              >
                {text}
              </Text>
            </button>
          )}
          {long && !editing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={all}
              onClick={() => setAll((open) => !open)}
              className="text-foreground -ms-(--space-2) self-start font-semibold"
            >
              {all ? COPY.showLess : COPY.showAll}
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
}
