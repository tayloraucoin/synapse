"use client";

import * as React from "react";
import { parseAsString, useQueryStates } from "nuqs";
import {
  cn,
  Collapsible,
  CollapsibleContent,
  InlineAddRow,
  NoticeIcon,
  SkeletonRow,
  Text,
  usePrefersReducedMotion,
} from "@syn/ui";
import { useDataSource } from "@/lib/data/source";
import { useTodos } from "@/lib/data/use-todos";
import { TodosTrayLine } from "../todos-tray-line";
import { TODOS_TRAY_COPY as COPY } from "./copy";
import { TodosTrayRow } from "./todos-tray-row";

/**
 * TodosTray — the to-dos beside the day (USE-19; day/todos/). A disclosure
 * under the screen's header, full width between hairlines; open, it pushes
 * the screen down and covers nothing. Its rows are its own query
 * (`useTodos`): their loading or failure never blanks the screen beneath,
 * and the screen's never blanks them.
 *
 * Closed by default; a reminder is the one way in that opens it, on that
 * to-do (`focusTodoId`), tinted for a moment. Reused by Review the day and
 * Schedule, so it takes nothing of Now's.
 */
export interface TodosTrayProps {
  /** The to-do a reminder opened it on: open, that row tinted, its time in ink. */
  focusTodoId?: string | null;
  /** Open on load (a capture's seed). */
  defaultOpen?: boolean;
  /** The tint stays until a tap rather than fading, so a capture holds still. */
  holdTint?: boolean;
  className?: string;
}

/** How long the reminded row stays tinted: about two seconds (from-a-reminder.md [ASSUMPTION]). */
export const REMINDED_TINT_MS = 2000;

export function TodosTray({
  focusTodoId = null,
  defaultOpen = false,
  holdTint = false,
  className,
}: TodosTrayProps) {
  const source = useDataSource();
  const todos = useTodos(source.todayKey());
  const [open, setOpen] = React.useState(defaultOpen || focusTodoId !== null);
  const [, setSheet] = useQueryStates({
    sheet: parseAsString,
    id: parseAsString,
  });
  const contentId = React.useId();

  // A reminder opens the tray on its to-do, also once the screen is up.
  React.useEffect(() => {
    if (focusTodoId !== null) setOpen(true);
  }, [focusTodoId]);

  const tinted = useReminderTint(focusTodoId, holdTint);
  const focusRef = React.useRef<HTMLDivElement>(null);
  const hasRows = todos.rows !== undefined;
  React.useEffect(() => {
    // A long tray scrolls the reminded to-do into view [ASSUMPTION].
    if (open && hasRows) focusRef.current?.scrollIntoView({ block: "nearest" });
  }, [open, hasRows]);

  const rows = todos.rows ?? [];
  const first = rows.find((row) => !row.checked)?.title ?? null;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("border-hairline border-y", className)}
    >
      <TodosTrayLine
        label={COPY.label}
        first={first}
        open={open}
        controls={contentId}
        onToggle={() => setOpen((was) => !was)}
      />
      <CollapsibleContent
        id={contentId}
        className="px-(--space-2) pb-(--space-1)"
      >
        {todos.isPending ? (
          // Loading: one quiet row above a working "Add a to-do"; no spinner.
          <SkeletonRow lines={1} className="px-(--space-3)" />
        ) : todos.isError ? (
          <ListFailed onRetry={() => void todos.retry()} />
        ) : (
          <ul className="flex flex-col">
            {rows.map((row) => (
              <li key={row.id}>
                <TodosTrayRow
                  ref={row.id === focusTodoId ? focusRef : undefined}
                  row={row}
                  reminded={row.id === focusTodoId}
                  tinted={row.id === focusTodoId && tinted}
                  failed={todos.failed.has(row.id)}
                  onCheckedChange={(id, checked) =>
                    void (checked ? todos.check(id) : todos.uncheck(id))
                  }
                  onOpen={(id) => void setSheet({ sheet: "todo", id })}
                  onRetry={(id) => void todos.retryWrite(id)}
                />
              </li>
            ))}
          </ul>
        )}
        <InlineAddRow
          label={COPY.add}
          placeholder={COPY.addPlaceholder}
          maxLength={COPY.titleMax}
          keepOpen
          onSubmit={(title) => void todos.add(title)}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

/** The list did not load: one line in ink with the info icon. Never red, no count. */
function ListFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <p
      role="status"
      className="flex min-h-(--target) items-center gap-(--space-2) px-(--space-3)"
    >
      <NoticeIcon aria-hidden="true" className="text-ink size-4 shrink-0" />
      <Text as="span" variant="secondary" tone="ink">
        {COPY.listFailed}{" "}
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer underline underline-offset-2"
        >
          {COPY.tryAgain}
        </button>
        .
      </Text>
    </p>
  );
}

/**
 * The reminded row's tint: on while the reminder's to-do is focused, then it
 * fades on its own after about two seconds. With reduced motion it is shown
 * without a fade and goes at once on the next tap.
 */
function useReminderTint(focusTodoId: string | null, hold: boolean): boolean {
  const reduced = usePrefersReducedMotion() || hold;
  const [tinted, setTinted] = React.useState(focusTodoId !== null);

  React.useEffect(() => {
    if (focusTodoId === null) return;
    setTinted(true);
    if (reduced) {
      const clear = () => setTinted(false);
      window.addEventListener("pointerdown", clear, { once: true });
      return () => window.removeEventListener("pointerdown", clear);
    }
    const timer = window.setTimeout(() => setTinted(false), REMINDED_TINT_MS);
    return () => window.clearTimeout(timer);
  }, [focusTodoId, reduced]);

  return tinted;
}
