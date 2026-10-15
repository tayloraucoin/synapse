"use client";

import * as React from "react";
import {
  AddIcon,
  BackIcon,
  Button,
  CloseIcon,
  cn,
  IconTile,
  ReorderIcon,
  ResponsiveSheet,
  SortableHandle,
  SortableList,
  Text,
  toastUndo,
} from "@syn/ui";
import type { MealTopicRecord } from "@syn/validators";
import { useMealTopics } from "@/lib/data/use-meal-topics";
import { IconPickerStep } from "./icon-picker-step";
import {
  draftProblems,
  EMPTY_TOPIC,
  MealTopicEditStep,
  type MealTopicDraft,
} from "./meal-topic-edit-step";
import { MEAL_TOPICS_COPY } from "./meal-topics-copy";

const COPY = MEAL_TOPICS_COPY.sheet;
const EDIT = MEAL_TOPICS_COPY.edit;

/**
 * MealTopicsSheet (USE-22; interactions/meal-topics): the saved topics, one
 * per row with its icon on its kind chip, its name, its link's kind and value
 * and a grip. Tap a row to edit it; swipe it left to delete, with Undo in the
 * toast; drag the grip to reorder (the chips' order); Add a topic opens an
 * empty one. The icon tile opens USE-11's picker as a step inside this sheet,
 * back on the left: never a second sheet. × closes onto the screen beneath,
 * and a change already shows on the meal's chips.
 *
 * The canvas's closing caption is a pointer, not shipped (D-USE-74).
 */

type Step =
  | { kind: "list" }
  | {
      kind: "edit";
      /** Null: a new topic. */
      id: string | null;
      draft: MealTopicDraft;
      picking: boolean;
      tried: boolean;
    };

/** How far left a row travels before letting go deletes it [devs' call]. */
const SWIPE_DELETE_PX = 96;

export interface MealTopicsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function MealTopicsSheet({
  open,
  onOpenChange,
  returnFocusRef,
}: MealTopicsSheetProps) {
  const { query, add, update, remove, restore, reorder } = useMealTopics();
  const topics = query.data ?? [];
  const [step, setStep] = React.useState<Step>({ kind: "list" });
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);

  function close(next: boolean) {
    if (!next) setStep({ kind: "list" });
    onOpenChange(next);
  }

  function openEdit(topic: MealTopicRecord | null) {
    setStep({
      kind: "edit",
      id: topic?.id ?? null,
      draft:
        topic === null
          ? EMPTY_TOPIC
          : {
              name: topic.name,
              icon: topic.icon,
              linkKind: topic.linkKind,
              linkValue: topic.linkValue,
            },
      picking: false,
      tried: false,
    });
  }

  function removeTopic(topic: MealTopicRecord) {
    remove.mutate(topic.id, {
      onSuccess: (row) => {
        if (!row) return;
        toastUndo({
          text: COPY.removed(row.name),
          onUndo: () => restore.mutate(row),
        });
      },
    });
  }

  function save() {
    if (step.kind !== "edit") return;
    if (draftProblems(step.draft) !== null) {
      setStep({ ...step, tried: true });
      nameRef.current?.focus();
      return;
    }
    const fields = {
      name: step.draft.name.trim(),
      icon: step.draft.icon,
      linkKind: step.draft.linkKind,
      linkValue: step.draft.linkValue.trim(),
    };
    if (step.id === null) add.mutate(fields);
    else update.mutate({ id: step.id, fields });
    setStep({ kind: "list" });
  }

  function deleteFromEdit() {
    if (step.kind !== "edit" || step.id === null) return;
    const topic = topics.find((t) => t.id === step.id);
    setStep({ kind: "list" });
    if (topic) removeTopic(topic);
  }

  const editing = step.kind === "edit" ? step : null;
  const picking = editing?.picking === true;

  const header =
    editing === null ? (
      <div className="flex min-w-0 flex-1 items-center">
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.close}
          onClick={() => close(false)}
          className="-ms-(--space-3)"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      </div>
    ) : picking ? (
      // The picker draws its own back; the step needs only its name.
      <h2 className="sr-only">{EDIT.icon}</h2>
    ) : (
      <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
        <Button
          variant="ghost"
          size="icon"
          aria-label={EDIT.backLabel}
          onClick={() => setStep({ kind: "list" })}
          className="-ms-(--space-3)"
        >
          <BackIcon aria-hidden="true" />
        </Button>
        <Text
          ref={titleRef}
          as="h2"
          variant="row-title"
          weight={600}
          tabIndex={-1}
          className="outline-none"
        >
          {editing.id === null ? EDIT.newTitle : EDIT.editTitle}
        </Text>
      </div>
    );

  const footer =
    editing === null || picking ? undefined : (
      <div className="flex flex-col gap-(--space-2)">
        <Button className="w-full" onClick={save}>
          {editing.id === null ? EDIT.add : EDIT.save}
        </Button>
        {editing.id === null ? null : (
          <Button variant="ghost" className="w-full" onClick={deleteFromEdit}>
            {EDIT.delete}
          </Button>
        )}
      </div>
    );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={close}
      title={COPY.title}
      subtitle={COPY.line}
      header={header}
      // The × (or the back) is in the header: no second close.
      headerAction={null}
      footer={footer}
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        content:
          "data-[vaul-drawer-direction=bottom]:h-(--meal-topics-sheet-h)",
        // The picker draws its own back, so its step has no header row.
        header: picking ? "sr-only" : "items-center pt-(--space-2)",
        body: cn("pt-(--space-2)", picking && "flex flex-col"),
        footer: "border-t-0",
      }}
    >
      {editing === null ? (
        <TopicList
          topics={topics}
          onEdit={openEdit}
          onRemove={removeTopic}
          onReorder={(ids) => reorder.mutate(ids)}
          onAdd={() => openEdit(null)}
        />
      ) : picking ? (
        <IconPickerStep
          name={editing.draft.name.trim()}
          value={editing.draft.icon}
          backLabel={editing.id === null ? EDIT.newTitle : EDIT.editTitle}
          onBack={() => setStep({ ...editing, picking: false })}
          onPick={(icon) =>
            setStep({
              ...editing,
              picking: false,
              draft: { ...editing.draft, icon },
            })
          }
          onRecolour={(icon) =>
            setStep({ ...editing, draft: { ...editing.draft, icon } })
          }
        />
      ) : (
        <MealTopicEditStep
          draft={editing.draft}
          onChange={(draft) => setStep({ ...editing, draft })}
          onOpenIcon={() => setStep({ ...editing, picking: true })}
          problems={editing.tried ? draftProblems(editing.draft) : null}
          nameRef={nameRef}
        />
      )}
    </ResponsiveSheet>
  );
}

function TopicList({
  topics,
  onEdit,
  onRemove,
  onReorder,
  onAdd,
}: {
  topics: readonly MealTopicRecord[];
  onEdit: (topic: MealTopicRecord) => void;
  onRemove: (topic: MealTopicRecord) => void;
  onReorder: (ids: string[]) => void;
  onAdd: () => void;
}) {
  const hintId = React.useId();
  const items = topics.map((topic) => ({ ...topic, title: topic.name }));
  return (
    <div className="flex flex-col">
      <Text as="h2" variant="heading">
        {COPY.title}
      </Text>
      <Text
        as="p"
        variant="secondary"
        tone="secondary"
        className="mt-(--space-2) mb-(--space-4)"
      >
        {COPY.line}
      </Text>
      <span id={hintId} className="sr-only">
        {COPY.deleteHint}
      </span>

      <SortableList
        items={items}
        label={COPY.list}
        onReorder={onReorder}
        className="border-hairline border-t"
        renderItem={(topic, { handleProps }) => (
          <SwipeToDelete onDelete={() => onRemove(topic)}>
            <button
              type="button"
              aria-label={COPY.editRow(topic.name)}
              aria-describedby={hintId}
              onClick={() => onEdit(topic)}
              className="flex min-h-(--row-min) min-w-0 flex-1 cursor-pointer items-center gap-(--space-3) py-(--space-2) text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <IconTile icon={topic.icon} />
              <span className="flex min-w-0 flex-1 flex-col">
                <Text as="span" variant="row-title" truncate>
                  {topic.name}
                </Text>
                <Text as="span" variant="caption" tone="secondary" truncate>
                  {COPY.link(topic.linkKind, topic.linkValue)}
                </Text>
              </span>
            </button>
            <span data-grip className="-me-(--space-2) flex">
              <SortableHandle {...handleProps}>
                <ReorderIcon aria-hidden="true" className="size-4" />
              </SortableHandle>
            </span>
          </SwipeToDelete>
        )}
      />

      <button
        type="button"
        onClick={onAdd}
        className="text-text-secondary hover:text-ink flex min-h-(--row-min) cursor-pointer items-center gap-(--space-3) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="flex size-9 shrink-0 items-center justify-center">
          <AddIcon aria-hidden="true" className="size-4" />
        </span>
        <Text as="span" variant="row-title" tone="secondary">
          {COPY.add}
        </Text>
      </button>
    </div>
  );
}

/**
 * A row that follows a finger left and deletes when let go past
 * `SWIPE_DELETE_PX`. The grip is left to the list; a mostly vertical move
 * is a scroll; a swipe swallows the tap that ends it. Keyboard and screen
 * readers delete from the topic's own step.
 */
function SwipeToDelete({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const start = React.useRef<{ x: number; y: number } | null>(null);
  const swiped = React.useRef(false);
  const [dx, setDx] = React.useState(0);

  function end() {
    if (dx <= -SWIPE_DELETE_PX) onDelete();
    start.current = null;
    setDx(0);
  }

  return (
    <div
      // Vaul drags the sheet on any pointer move unless told not to.
      data-vaul-no-drag
      className={cn(
        // The hairline is the row's, not the list item's: a lifted row keeps its own outline.
        "border-hairline flex w-full items-center gap-(--space-2) border-b touch-pan-y",
        dx === 0 &&
          "motion-safe:transition-transform motion-safe:duration-(--dur-state)",
      )}
      style={dx === 0 ? undefined : { transform: `translateX(${dx}px)` }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if ((event.target as Element).closest("[data-grip]")) return;
        start.current = { x: event.clientX, y: event.clientY };
        swiped.current = false;
      }}
      onPointerMove={(event) => {
        const from = start.current;
        if (from === null) return;
        const across = event.clientX - from.x;
        const down = event.clientY - from.y;
        if (!swiped.current && Math.abs(down) > Math.abs(across)) {
          start.current = null;
          return;
        }
        if (across < -8) {
          swiped.current = true;
          setDx(Math.min(0, across));
        }
      }}
      onPointerUp={end}
      onPointerCancel={() => {
        start.current = null;
        setDx(0);
      }}
      onClickCapture={(event) => {
        if (!swiped.current) return;
        swiped.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
