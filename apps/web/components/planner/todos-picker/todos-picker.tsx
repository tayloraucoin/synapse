"use client";

import * as React from "react";
import {
  Button,
  Checkbox,
  CloseIcon,
  cn,
  ItemIcon,
  RegionRetry,
  ResponsiveSheet,
  SkeletonRow,
  Text,
} from "@syn/ui";
import {
  TODOS_BLOCK_COPY,
  todosPickerView,
  type TodoTypeFilter,
} from "@/lib/data/block-view-todos";
import type { BlockView } from "@/lib/data/use-block-view";
import { useTodosRecords } from "@/lib/data/use-todos-pool";

/**
 * TodosPicker — From To-dos on a To-dos block (USE-50; block-view/states/
 * todos-pool.md, open-5 round 4, D-USE-87): a `ResponsiveSheet` (a bottom
 * sheet at 402, the right panel at the desk, D-USE-39). × on the left,
 * "Into Errands · Sat 17, 10:00 to 12:30" over "From To-dos"; the Type
 * chips, All types first and then only the types listed, one at a time,
 * narrowing this list only (C-USE-block-view-kind-2); rows on hairlines,
 * each a checkbox, the to-do's icon, its name and meta line, its length
 * trailing; a to-do already in the block greyed with "In Errands" and no
 * checkbox. Over Add, the line naming what is added and where the block
 * then ends: inside its time muted, past it in ink, adding still allowed.
 * No to-dos with no day reads "Nothing in To-dos." over New to-do.
 */
export interface TodosPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The block on its date, from `useBlockView`. */
  block: BlockView;
  dateKey: string;
  /** Add to <block>: the checked to-dos, in the list's order, and their names. */
  onAdd: (todoIds: string[], titles: string[]) => void;
  /** No to-dos: New to-do instead. */
  onNewTodo: () => void;
  /** For a capture: rows checked, a type picked. */
  initial?: { checked?: string[]; type?: TodoTypeFilter };
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

const P = TODOS_BLOCK_COPY.picker;

const CHIP =
  "inline-flex h-8 items-center rounded-full border px-(--space-3) text-(length:--fs-caption) font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TodosPicker({
  open,
  onOpenChange,
  block,
  dateKey,
  onAdd,
  onNewTodo,
  initial,
  returnFocusRef,
}: TodosPickerProps) {
  const records = useTodosRecords(dateKey);
  const [checked, setChecked] = React.useState<string[]>(
    () => initial?.checked ?? [],
  );
  const [type, setType] = React.useState<TodoTypeFilter>(
    () => initial?.type ?? null,
  );
  // A fresh pick each time it opens; the seed only on the first.
  const seeded = React.useRef(true);
  React.useEffect(() => {
    if (open && !seeded.current) {
      setChecked([]);
      setType(null);
    }
    if (!open) seeded.current = false;
  }, [open]);

  const view = records.data
    ? todosPickerView({
        records: records.data,
        view: block,
        now: records.now(),
        checked,
        type,
      })
    : null;
  const name = block.block.block.name;
  const lineId = React.useId();

  function toggle(todoId: string) {
    setChecked((now) =>
      now.includes(todoId)
        ? now.filter((id) => id !== todoId)
        : [...now, todoId],
    );
  }

  const header = (
    <div className="flex min-w-0 flex-1 flex-col">
      <Button
        variant="ghost"
        size="icon"
        aria-label={P.close}
        onClick={() => onOpenChange(false)}
        className="text-foreground -ms-(--space-3) self-start"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <Text as="p" variant="caption" tone="muted">
        {P.context(name, dateKey, block.block.startsAt, block.block.endsAt)}
      </Text>
      <Text as="h2" variant="heading">
        {P.title}
      </Text>
    </div>
  );

  const empty = view !== null && view.rows.length === 0 && type === null;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={P.title}
      header={header}
      headerAction={null}
      returnFocusRef={returnFocusRef}
      classes={{
        header: "pt-(--space-2)",
        body: "flex flex-col gap-(--space-3) pt-(--space-3)",
        footer: "border-t-0",
      }}
      footer={
        empty ? null : (
          <div className="flex flex-col gap-(--space-3)">
            {view?.footer ? (
              <Text
                as="p"
                id={lineId}
                variant="secondary"
                aria-live="polite"
                data-picker-line=""
                // Past its time: in ink, never red (D-USE-87).
                tone={view.footer.inside ? "muted" : "body"}
                className={cn(!view.footer.inside && "font-medium")}
              >
                {view.footer.text}
              </Text>
            ) : null}
            <Button
              size="lg"
              className="w-full"
              aria-describedby={view?.footer ? lineId : undefined}
              disabled={!view || view.checked.length === 0}
              onClick={() => view && onAdd(view.checked, view.titles)}
            >
              {P.addTo(name)}
            </Button>
          </div>
        )
      }
    >
      {records.isError ? (
        <RegionRetry label={P.failed} onRetry={() => void records.refetch()} />
      ) : !view ? (
        <div aria-busy="true" aria-label={P.loading}>
          {[0, 1, 2, 3].map((n) => (
            <SkeletonRow key={n} className="px-0" />
          ))}
        </div>
      ) : empty ? (
        // At the top, never centred (A-08); D-USE-87.
        <div className="flex flex-col items-start gap-(--space-3)">
          <Text as="p" variant="body">
            {P.nothing}
          </Text>
          <Button variant="secondary" onClick={onNewTodo}>
            {TODOS_BLOCK_COPY.newTodo}
          </Button>
        </div>
      ) : (
        <>
          <div
            role="group"
            aria-label={P.types}
            className="flex flex-wrap gap-(--space-2)"
          >
            {view.chips.map((chip) => {
              const on = chip.value === type;
              return (
                <button
                  key={chip.label}
                  type="button"
                  aria-pressed={on}
                  aria-label={chip.name}
                  onClick={() => setType(chip.value)}
                  className={cn(
                    CHIP,
                    on
                      ? "border-foreground bg-foreground text-background"
                      : "border-hairline text-foreground",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          <ul className="flex flex-col">
            {view.rows.map((row) => {
              const id = `todo-pick-${row.todoId}`;
              return (
                <li
                  key={row.todoId}
                  data-in-block={row.inBlock || undefined}
                  className="border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-b"
                >
                  {row.inBlock ? (
                    <span aria-hidden="true" className="size-5 shrink-0" />
                  ) : (
                    <Checkbox
                      id={id}
                      aria-label={row.name}
                      checked={view.checked.includes(row.todoId)}
                      onCheckedChange={() => toggle(row.todoId)}
                    />
                  )}
                  <ItemIcon
                    icon={row.icon}
                    size={24}
                    className={cn("shrink-0", row.inBlock && "opacity-50")}
                  />
                  <label
                    htmlFor={row.inBlock ? undefined : id}
                    className={cn(
                      "flex min-w-0 flex-1 flex-col py-(--space-2)",
                      row.inBlock ? "cursor-default" : "cursor-pointer",
                    )}
                  >
                    <Text
                      as="span"
                      tone={row.inBlock ? "muted" : "body"}
                      truncate
                    >
                      {row.title}
                    </Text>
                    {row.inBlock ? null : (
                      <Text as="span" variant="caption" tone="muted" truncate>
                        {row.meta}
                      </Text>
                    )}
                  </label>
                  <Text
                    as="span"
                    variant="caption"
                    tone="muted"
                    className="shrink-0 tabular-nums"
                  >
                    {row.trailing}
                  </Text>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </ResponsiveSheet>
  );
}
