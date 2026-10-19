"use client";

/**
 * AddSheet (USE-54; add-from-the-rail/states/add-sheet.md; D-USE-16,
 * D-USE-19, D-USE-22): adding to the laid-out day at a time, today only. A
 * `ResponsiveSheet`: the bottom sheet at 402, the right panel at
 * `--sheet-w` from 768 (D-USE-39).
 *
 * Top to bottom: × on the left, the scope line ("Monday · lands in Work,
 * 9:30 to 12:00") over "Add"; Item or Block; the icon slot and the name,
 * focused; Starts ("−15 | 10:15 | +15", typed too); Length; At a set time;
 * Tier, only in Work; Notes (optional), growing; the foot line when the
 * block is full; Add.
 *
 * From a block's Add row (D-USE-22) the tier is preset and there is no
 * Starts. Block hands the time to the New block sheet (USE-46). Add with
 * room writes at once with no question; with none it goes to Make room
 * (USE-41). Nothing red: no name is "Name needed" on faded ink, still
 * focusable; a failed add is "Not added." in ink and keeps what was typed.
 */
import * as React from "react";
import type { WorkTier } from "@syn/types";
import {
  Button,
  CloseIcon,
  cn,
  Input,
  ItemIcon,
  MinutesStepper,
  NoIconIcon,
  ResponsiveSheet,
  SegmentedControl,
  Switch,
  Text,
  Textarea,
} from "@syn/ui";
import { clockFromMinutes, clockToMinutes } from "@syn/utils";
import type { AppRoomDay } from "@/lib/data/room-day";
import { clockLabel } from "../day-column/copy";
import { IconPickerStep } from "../icon-picker-step";
import {
  RAIL_STEP_MIN,
  stepTime,
  typedTime,
  type DayWindow,
} from "../rail-add/drag";
import { ADD_SHEET_COPY as COPY, TIER_WORDS } from "./copy";
import {
  ADD_LENGTH_MAX,
  ADD_LENGTH_MIN,
  canAdd,
  footLine,
  isFull,
  landingOf,
  openAddForm,
  planAdd,
  scopeLine,
  showsTier,
  type AddForm,
  type AddKind,
  type AddPlan,
  type AddStart,
} from "./form";

const TIERS = ["urgent", "primary", "secondary", "stretch"] as const;

/** Picked is a raised segment on the surface, as drawn (USE-51's tier field). */
const SEGMENTS = {
  group: "bg-surface gap-0 border-0 p-(--space-1)",
  item: cn(
    "bg-surface text-muted-foreground min-w-0 rounded-(--radius-control) font-normal",
    "hover:bg-paper has-checked:bg-background has-checked:text-foreground has-checked:font-semibold",
    "has-checked:border-hairline has-checked:border",
  ),
};

const ROW =
  "border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-t";

export interface AddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  start: AddStart;
  /** The day as the room engine weighs it; null while it reads. */
  day: AppRoomDay | null;
  /** The column's hours: Starts steps inside them. */
  hours: DayWindow;
  /** A capture's typed fields (`?state=`), applied on open. */
  preset?: Partial<AddForm>;
  /** The add: a write with room, Make room without. Rejects when not added. */
  onAdd: (plan: AddPlan) => Promise<void>;
  /** Block: the New block sheet at this time. */
  onBlock: (at: string) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function AddSheet({
  open,
  onOpenChange,
  dateKey,
  start,
  day,
  hours,
  preset,
  onAdd,
  onBlock,
  returnFocusRef,
}: AddSheetProps) {
  const [form, setForm] = React.useState<AddForm>(() => ({
    ...openAddForm(start),
    ...preset,
  }));
  const [step, setStep] = React.useState<"fields" | "icon">("fields");
  const [failed, setFailed] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const iconRef = React.useRef<HTMLButtonElement>(null);
  const ids = {
    name: React.useId(),
    pinned: React.useId(),
    pinnedLine: React.useId(),
    notes: React.useId(),
    foot: React.useId(),
  };

  // Each opening starts from where it was opened.
  const startKey = `${start.at ?? ""}|${start.blockId ?? ""}|${start.tier ?? ""}`;
  const opening = React.useRef({ start, preset });
  opening.current = { start, preset };
  React.useEffect(() => {
    if (!open) return;
    const { start: from, preset: typed } = opening.current;
    setForm({ ...openAddForm(from), ...typed });
    setStep("fields");
    setFailed(false);
  }, [open, startKey]);

  // The name takes focus once the sheet's content has mounted.
  React.useEffect(() => {
    if (!open || step !== "fields") return;
    let tries = 0;
    let timer = 0;
    const focusName = () => {
      const field = nameRef.current;
      if (field === null) {
        tries += 1;
        if (tries < 20) timer = window.setTimeout(focusName, 50);
        return;
      }
      field.focus();
    };
    timer = window.setTimeout(focusName, 50);
    return () => window.clearTimeout(timer);
  }, [open, step]);

  const landing = day === null ? null : landingOf(day, form, start.blockId);
  const full =
    day !== null && landing !== null ? isFull(day, landing, form) : false;
  const foot = failed ? COPY.notAdded : footLine(landing, form, full);
  const named = form.title.trim() !== "";
  const ready = canAdd(form, landing);
  const at = form.startsAt === null ? null : clockLabel(form.startsAt);

  const set = (patch: Partial<AddForm>) => {
    setFailed(false);
    setForm((now) => ({ ...now, ...patch }));
  };

  function onKind(kind: AddKind) {
    if (kind !== "block") return;
    onBlock(
      form.startsAt ?? landing?.startsAt ?? clockFromMinutes(hours.startMin),
    );
  }

  async function send() {
    if (!ready || sending || day === null || landing === null) return;
    const plan = planAdd(day, landing, form);
    // No room: the sheet gives way to Make room, which owns the rest.
    if (plan.kind === "room") {
      onOpenChange(false);
      void onAdd(plan);
      return;
    }
    setSending(true);
    try {
      await onAdd(plan);
      onOpenChange(false);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  const header =
    step !== "fields" ? (
      <span className="sr-only">{COPY.title}</span>
    ) : (
      <div className="flex min-w-0 flex-1 items-start gap-(--space-2)">
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.close}
          onClick={() => onOpenChange(false)}
          className="-ms-(--space-3)"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
        <div className="flex min-w-0 flex-col pt-(--space-1) pb-(--space-3)">
          <Text as="p" variant="caption" tone="secondary">
            {scopeLine(dateKey, landing, form)}
          </Text>
          <Text as="h2" variant="heading">
            {COPY.title}
          </Text>
        </div>
      </div>
    );

  const footer =
    step !== "fields" ? undefined : (
      <div className="flex flex-col gap-(--space-3)">
        {foot !== null || landing === null ? (
          <Text
            as="p"
            id={ids.foot}
            variant="secondary"
            tone={failed ? undefined : "secondary"}
            aria-live="polite"
          >
            {foot ?? (day === null ? null : COPY.noBlockLine)}
          </Text>
        ) : null}
        <Button
          className={cn(
            "h-12 w-full font-semibold",
            !ready &&
              "bg-fill-muted text-muted-foreground hover:bg-fill-muted cursor-not-allowed",
          )}
          aria-disabled={ready ? undefined : true}
          aria-describedby={foot !== null ? ids.foot : undefined}
          onClick={() => void send()}
        >
          {named ? COPY.add : COPY.nameNeeded}
        </Button>
      </div>
    );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.title}
      header={header}
      headerAction={null}
      footer={footer}
      size="tall"
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      classes={{
        header: step !== "fields" ? "hidden" : "items-start pt-(--space-2)",
        body: "pt-0",
        footer: "border-t-0",
      }}
    >
      {step === "icon" ? (
        <IconPickerStep
          name={form.title}
          value={form.icon}
          backLabel={COPY.iconBack(form.title.trim())}
          onBack={() => {
            setStep("fields");
            requestAnimationFrame(() => iconRef.current?.focus());
          }}
          onPick={(icon) => {
            set({ icon });
            setStep("fields");
          }}
          onRecolour={(icon) => set({ icon })}
        />
      ) : (
        <div className="flex flex-col">
          <SegmentedControl<AddKind>
            label={<span className="sr-only">{COPY.kind}</span>}
            stacked={false}
            value={form.kind}
            onChange={onKind}
            options={[
              { value: "item", label: COPY.item },
              { value: "block", label: COPY.block },
            ]}
            classes={SEGMENTS}
            className="pb-(--space-3)"
          />

          <div className="flex items-center gap-(--space-2) pb-(--space-3)">
            <button
              ref={iconRef}
              type="button"
              aria-label={COPY.icon(iconWord(form))}
              onClick={() => setStep("icon")}
              className={cn(
                "inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius) border border-dashed border-input",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              {form.icon === null ? (
                <NoIconIcon
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
              ) : (
                <ItemIcon icon={form.icon} size={24} />
              )}
            </button>
            <label htmlFor={ids.name} className="sr-only">
              {COPY.name}
            </label>
            <Input
              ref={nameRef}
              id={ids.name}
              value={form.title}
              maxLength={120}
              onChange={(event) => set({ title: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void send();
                }
              }}
              classes={{ root: "min-w-0 flex-1" }}
            />
          </div>

          {form.startsAt !== null ? (
            <div className={ROW}>
              <Text as="span" variant="body" className="flex-1">
                {COPY.starts}
              </Text>
              <StartsStepper
                value={form.startsAt}
                hours={hours}
                onChange={(startsAt) => set({ startsAt })}
              />
            </div>
          ) : null}

          <div className={ROW}>
            <Text as="span" variant="body" className="flex-1">
              {COPY.length}
            </Text>
            <MinutesStepper
              value={form.lengthMin}
              onChange={(lengthMin) => set({ lengthMin })}
              min={ADD_LENGTH_MIN}
              max={ADD_LENGTH_MAX}
              step={RAIL_STEP_MIN}
              label={<span className="sr-only">{COPY.length}</span>}
              stepLabels={{ decrease: COPY.shorter, increase: COPY.longer }}
            />
          </div>

          {form.startsAt !== null ? (
            <div className="border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-t py-(--space-3)">
              <div className="flex min-w-0 flex-1 flex-col">
                <Text as="label" htmlFor={ids.pinned} variant="body">
                  {COPY.setTime}
                </Text>
                <Text
                  as="span"
                  id={ids.pinnedLine}
                  variant="caption"
                  tone="secondary"
                >
                  {COPY.setTimeLine(at)}
                </Text>
              </div>
              <Switch
                id={ids.pinned}
                checked={form.pinned}
                aria-describedby={ids.pinnedLine}
                onCheckedChange={(pinned) => set({ pinned })}
              />
            </div>
          ) : null}

          {showsTier(landing) ? (
            <div className="border-hairline flex flex-col gap-(--space-2) border-t py-(--space-3)">
              <SegmentedControl<WorkTier>
                label={
                  <Text as="span" variant="secondary" tone="secondary">
                    {COPY.tier}
                  </Text>
                }
                stacked={false}
                value={form.tier}
                onChange={(tier) => set({ tier })}
                options={TIERS.map((tier) => ({
                  value: tier,
                  label: TIER_WORDS[tier],
                }))}
                classes={SEGMENTS}
              />
            </div>
          ) : null}

          <div className="border-hairline flex flex-col gap-(--space-2) border-t py-(--space-3)">
            <Textarea
              id={ids.notes}
              label={COPY.notes}
              placeholder={COPY.notesPlaceholder}
              value={form.notes}
              onChange={(event) => set({ notes: event.target.value })}
              autoGrow
              rows={1}
            />
          </div>
        </div>
      )}
    </ResponsiveSheet>
  );
}

/** Starts: "−15 | 10:15 | +15", the time typed too (D-USE-19). */
function StartsStepper({
  value,
  hours,
  onChange,
}: {
  value: string;
  hours: DayWindow;
  onChange: (startsAt: string) => void;
}) {
  const minutes = clockToMinutes(value);
  const [draft, setDraft] = React.useState<string | null>(null);
  const by = (delta: number) =>
    onChange(clockFromMinutes(stepTime(minutes, delta, hours)));
  // A typed time is kept as typed, inside the day; anything else reverts.
  const commit = () => {
    if (draft === null) return;
    const typed = typedTime(draft, hours);
    if (typed !== null) onChange(clockFromMinutes(typed));
    setDraft(null);
  };
  const step =
    "h-(--target) rounded-none px-(--space-2) text-(length:--fs-secondary) font-normal text-muted-foreground";
  return (
    <div className="flex shrink-0 items-stretch overflow-hidden rounded-(--radius-control) border border-input">
      <Button
        variant="ghost"
        aria-label={COPY.earlier}
        onClick={() => by(-RAIL_STEP_MIN)}
        className={step}
      >
        −15
      </Button>
      <Input
        aria-label={COPY.starts}
        inputMode="numeric"
        value={draft ?? clockLabel(value)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        classes={{
          root: "w-16",
          input:
            "h-(--target) rounded-none border-0 border-x border-input px-0 text-center font-semibold tabular-nums",
        }}
      />
      <Button
        variant="ghost"
        aria-label={COPY.later}
        onClick={() => by(RAIL_STEP_MIN)}
        className={step}
      >
        +15
      </Button>
    </div>
  );
}

function iconWord(form: AddForm): string | null {
  const { icon } = form;
  if (icon === null) return null;
  if (icon.kind === "emoji") return icon.value;
  if (icon.kind === "image") return "photo";
  return icon.value.replaceAll("-", " ");
}
