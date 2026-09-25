"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";

import type { DayPlanSummaryView, IconValue, TemplateSummaryView } from "@syn/types";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EllipsesMenu,
  EmojiSlot,
  Text,
  cn,
} from "@syn/ui";

import { WEEKDAY_SHORT, display, minutesOf } from "./clock";
import { DAY_BUILDER_COPY as COPY } from "./copy";

/**
 * `DayPlanCard` — UX v1.2 §4.13, §10.2 (collapsed · expanded · draft ·
 * deleting). The one-line summary as §4.13 writes it: the type with its
 * glyph, *up 7:00*, *work 9:00–17:30*, each placed workout with its glyph
 * and placement, *lights out 22:45*. The chevron opens the five lists (v1.3; DAY-11 added after work and free time)
 * with their lengths and, where another plan references the same
 * template, *shared with Day B*.
 */
export function DayPlanCard({
  plan,
  templates,
  onEdit,
  onContinue,
  onDuplicate,
  onDelete,
  disabled = false,
}: {
  plan: DayPlanSummaryView;
  /** For *shared with* — every template's `usedBy`. */
  templates: readonly TemplateSummaryView[];
  onEdit: () => void;
  onContinue: () => void;
  onDuplicate: () => void;
  onDelete: () => Promise<void>;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const listsId = React.useId();
  const draft = plan.state === "draft";

  const summary = summaryOf(plan);
  // The five lists (v1.3 §4.4 Your days; DAY-11) — after work and free time joined the three.
  const lists: Array<{ label: string; ref: DayPlanSummaryView["gettingReady"]; pool?: boolean }> = [
    { label: COPY.gettingReady, ref: plan.gettingReady },
    { label: COPY.morningRoutine, ref: plan.morning },
    { label: COPY.afterWork, ref: plan.afterWork },
    { label: COPY.freeTime, ref: plan.evenings, pool: true },
    { label: COPY.windDown, ref: plan.windDown },
  ];
  /** *Evenings A · 5 to choose from* — a pool offers, it takes no minutes. */
  const detailOf = (ref: NonNullable<DayPlanSummaryView["gettingReady"]>, pool: boolean) =>
    pool
      ? `${ref.name} · ${COPY.b16.toChooseFrom(templates.find((template) => template.id === ref.templateId)?.itemCount ?? 0)}`
      : `${ref.name} · ${ref.totalMin} min`;
  const sharedWith = (templateId: string) =>
    templates
      .find((template) => template.id === templateId)
      ?.usedBy.filter((user) => user.id !== plan.id)
      .map((user) => user.name) ?? [];

  return (
    <Card className={cn(deleting && "opacity-50")}>
      <CardHeader>
        <div className="flex items-start gap-(--space-3)">
          <EmojiSlot icon={plan.icon} size="card" />
          <div className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
            <CardTitle className="flex flex-wrap items-baseline gap-x-(--space-2)">
              <span>{plan.name}</span>
              {draft ? (
                <Text as="span" variant="caption" tone="secondary">
                  {COPY.unfinished}
                </Text>
              ) : null}
            </CardTitle>
            {plan.weekdays.length === 0 ? null : (
              <span className="flex flex-wrap gap-(--space-1)">
                {plan.weekdays.map((weekday) => (
                  <span
                    key={weekday}
                    className="border-hairline text-text-secondary inline-flex h-6 items-center rounded-(--radius) border px-(--space-2) text-(length:--fs-caption)"
                  >
                    {WEEKDAY_SHORT[weekday]}
                  </span>
                ))}
              </span>
            )}
            <Text as="p" variant="caption" tone="secondary" className="flex flex-wrap items-center gap-x-(--space-1) tabular-nums">
              {summary.map((part, index) => (
                <React.Fragment key={index}>
                  {index === 0 ? null : <span aria-hidden="true">·</span>}
                  {part.icon === null ? null : <EmojiSlot icon={part.icon} className="size-5 text-[1rem]" />}
                  <span>{part.text}</span>
                </React.Fragment>
              ))}
            </Text>
          </div>
          <EllipsesMenu
            label={plan.name}
            disabled={disabled || deleting}
            items={[
              { label: COPY.edit, onClick: onEdit },
              { label: COPY.duplicate, onClick: onDuplicate },
              { label: COPY.delete, onClick: () => setConfirm(true) },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-(--space-3)">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listsId}
          onClick={() => setOpen((current) => !current)}
          className="text-text-secondary inline-flex min-h-(--target) items-center gap-(--space-1) self-start rounded-(--radius) text-(length:--fs-caption) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronDown className={cn("size-4 transition-transform duration-(--dur-state)", open && "rotate-180")} aria-hidden="true" />
          <span>{open ? COPY.hideLists : COPY.showLists}</span>
        </button>
        {open ? (
          <ul id={listsId} className="m-0 flex list-none flex-col gap-(--space-1) p-0">
            {lists.map(({ label, ref, pool }) => {
              const shared = ref === null ? [] : sharedWith(ref.templateId);
              return (
                <li key={label} className="flex flex-wrap items-baseline gap-x-(--space-2)">
                  <Text as="span" variant="secondary" tone="secondary">
                    {label}
                  </Text>
                  <Text as="span" variant="secondary" className="tabular-nums">
                    {ref === null ? COPY.noList : detailOf(ref, pool === true)}
                  </Text>
                  {shared.length === 0 ? null : (
                    <Text as="span" variant="caption" tone="secondary">
                      {COPY.sharedWith(shared.join(", "))}
                    </Text>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
        {draft ? (
          <Button variant="secondary" disabled={disabled || deleting} onClick={onContinue} className="w-full wide:w-auto wide:self-start">
            {COPY.continueBuilding}
          </Button>
        ) : null}
      </CardContent>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={COPY.deleteTitle(plan.name)}
        description={COPY.deleteBody}
        confirmLabel={COPY.delete}
        cancelLabel={COPY.cancel}
        busy={deleting}
        onConfirm={() => {
          setConfirm(false);
          setDeleting(true);
          void onDelete().finally(() => setDeleting(false));
        }}
      />
    </Card>
  );
}

type SummaryPart = { icon: IconValue | null; text: string };

/** The summary line's parts, in §4.13's order; absent facts are simply absent. */
export function summaryOf(plan: DayPlanSummaryView): SummaryPart[] {
  const parts: SummaryPart[] = [];
  if (plan.work === null) parts.push({ icon: null, text: COPY.noWork });
  else parts.push({ icon: plan.work.icon, text: plan.work.name });
  const wake = minutesOf(plan.wakeClock);
  if (wake !== null) parts.push({ icon: null, text: COPY.upAt(display(wake)) });
  const start = minutesOf(plan.workStartClock);
  const end = minutesOf(plan.workEndClock);
  if (plan.work !== null && start !== null && end !== null) parts.push({ icon: null, text: COPY.work(display(start), display(end)) });
  for (const workout of plan.training) {
    parts.push({ icon: workout.icon, text: `${workout.title} ${COPY.placement[workout.placement] ?? ""}`.trim() });
  }
  const lightsOut = minutesOf(plan.lightsOutClock);
  if (lightsOut !== null) parts.push({ icon: null, text: COPY.lightsOutAt(display(lightsOut)) });
  return parts;
}
