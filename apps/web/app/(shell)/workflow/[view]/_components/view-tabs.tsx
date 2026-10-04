"use client";

import * as React from "react";

import type { WorkflowViewTab } from "@syn/types";
import { Input, Tabs, TabsList, TabsTrigger } from "@syn/ui";
import { WORKFLOW_NAME_MAX } from "@syn/constants";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";

/**
 * The view tabs (UX WF-01 header) — one per view, in creation order (no
 * control reorders them in v0.1). A tab is a navigation: choosing one opens
 * that view's route. They scroll sideways when they overflow; the padding
 * keeps the active line inside the scroller.
 *
 * RENAME IN PLACE (UX *Dialogs*): the current tab's name becomes a field;
 * `Enter` or blur saves, `Esc` restores, an emptied name restores.
 */
export function ViewTabs({
  tabs,
  viewId,
  renaming,
  onNavigate,
  onRename,
  onRenameEnd,
}: {
  tabs: readonly WorkflowViewTab[];
  viewId: string;
  renaming: boolean;
  onNavigate: (id: string) => void;
  onRename: (name: string) => void;
  onRenameEnd: () => void;
}) {
  const current = tabs.find((tab) => tab.id === viewId);
  const [value, setValue] = React.useState("");
  const cancelled = React.useRef(false);
  /** Ended by `Enter` or `Esc`: focus goes back to the tab, not to the page. */
  const byKey = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  // Read when a rename starts, not depended on: a refetch mid-edit must not reset the field.
  const currentName = React.useRef(current?.name ?? "");
  currentName.current = current?.name ?? "";

  React.useEffect(() => {
    if (!renaming) {
      if (!byKey.current) return;
      byKey.current = false;
      listRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
      return;
    }
    cancelled.current = false;
    setValue(currentName.current);
    // The field mounts while the menu still holds focus; take it once the menu has closed.
    const handle = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
    return () => window.clearTimeout(handle);
  }, [renaming]);

  return (
    <div ref={listRef} className="min-w-0 overflow-x-auto pb-(--space-2)">
      <Tabs value={viewId} activationMode="manual" onValueChange={onNavigate}>
        <TabsList variant="line" aria-label={COPY.viewsLabel} className="justify-start">
          {tabs.map((tab) =>
            renaming && tab.id === viewId ? (
              <Input
                key={tab.id}
                ref={inputRef}
                aria-label={COPY.rename}
                value={value}
                maxLength={WORKFLOW_NAME_MAX}
                className="w-44 flex-none"
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    byKey.current = true;
                    event.currentTarget.blur();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    cancelled.current = true;
                    byKey.current = true;
                    event.currentTarget.blur();
                  }
                }}
                onBlur={() => {
                  const trimmed = value.trim();
                  if (!cancelled.current && trimmed !== "" && trimmed !== tab.name) onRename(trimmed);
                  onRenameEnd();
                }}
              />
            ) : (
              <TabsTrigger key={tab.id} value={tab.id} className="flex-none">
                {tab.name}
              </TabsTrigger>
            ),
          )}
        </TabsList>
      </Tabs>
    </div>
  );
}
