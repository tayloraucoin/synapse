"use client";

/**
 * NewBlockSheet (USE-46; set-my-days/new-block-sheet/): adds a block or a
 * transition at a time, then goes to filling it. A `ResponsiveSheet`: the
 * bottom sheet at 402, the right panel at `--sheet-w` from 768; rows that
 * hold a control are 56 px.
 *
 * Top to bottom: × and the scope line over the title; Kind (blocks only);
 * the icon tile and Name; Starts, and Ends with the length beside it (never
 * Length, D-USE-34); Repeats (blocks only); Colour; the kind's own row
 * (Checklist, How work fills it, the To-dos fill line, Meal and its
 * topics); the consequence line; the primary, sticky at the foot.
 *
 * NOTHING BLOCKS BUT A NAME. A clash is a line in ink and Add stays live
 * (D-USE-33, D-USE-34). No name is "Name needed" on faded ink, aria-disabled
 * and still focusable. A failed add is "Not added." with Try again inline,
 * in ink, and keeps everything typed. Nothing red, no shake.
 *
 * The form's rules are `form.ts`; this file draws them and sends the add.
 * The icon tile opens USE-11's IconPickerStep as a step inside the sheet,
 * back on the left. Edit topics opens the Meal topics sheet over this one.
 * Repeats › Custom… opens CustomRecurrenceStep the same way (USE-47): Done
 * stores its one rule and the trigger reads it in words; back changes nothing.
 */
import * as React from "react";
import {
  Button,
  CloseIcon,
  cn,
  IconTile,
  Input,
  ItemIcon,
  NoIconIcon,
  NotSavedIcon,
  ResponsiveSheet,
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Switch,
  Text,
  TimeField,
} from "@syn/ui";
import { buildRule, type RepeatPreset } from "@syn/utils";
import { useMealTopics } from "@/lib/data/use-meal-topics";
import { HUE_DOT } from "../block-hue";
import {
  CUSTOM_RECURRENCE_COPY,
  CustomRecurrenceStep,
} from "../custom-recurrence";
import { IconPickerStep } from "../icon-picker-step";
import { MealTopicsSheet } from "../meal-topics-sheet";
import { clock, NEW_BLOCK_COPY as COPY } from "./copy";
import {
  colourLine,
  consequenceLine,
  customForm,
  hasChecklist,
  hasName,
  lengthMin,
  lengthWords,
  openForm,
  reduceForm,
  repeatLabel,
  repeatOptions,
  scopeLine,
  type NewBlockAction,
  type NewBlockForm,
} from "./form";
import { KindPicker } from "./kind-picker";
import {
  startTime,
  useNewBlockSheet,
  type NewBlockSheetStart,
} from "./use-new-block-sheet";

/** Where a capture starts the form (`?state=`), applied once on open. */
export interface NewBlockPreset {
  fields?: Partial<NewBlockForm>;
  /** The Repeats list open (repeats-menu.md), or Custom…'s step (custom-recurrence.md). */
  open?: "repeats" | "custom";
  /** Sends the add once on open, so a failed add is reachable (error.md). */
  add?: boolean;
}

export interface NewBlockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  start: NewBlockSheetStart | null;
  preset?: NewBlockPreset;
  /** The new block's or transition's id, once added. */
  onAdded: (id: string, form: NewBlockForm) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

type Step = "fields" | "icon" | "custom";

const ROW =
  "border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-t";

/** How long a capture waits for the sheet to rest before opening a list. */
const CAPTURE_SETTLE_MS = 600;

const CUSTOM = "custom";

function reducer(
  form: NewBlockForm | null,
  action: NewBlockAction | { type: "reset"; form: NewBlockForm | null },
): NewBlockForm | null {
  if (action.type === "reset") return action.form;
  return form === null ? null : reduceForm(form, action);
}

export function NewBlockSheet({
  open,
  onOpenChange,
  start,
  preset,
  onAdded,
  returnFocusRef,
}: NewBlockSheetProps) {
  const { day, add } = useNewBlockSheet(open ? start : null);
  const topics = useMealTopics();
  const [form, dispatch] = React.useReducer(reducer, null);
  const [step, setStep] = React.useState<Step>("fields");
  const [failed, setFailed] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [repeatsOpen, setRepeatsOpen] = React.useState(false);
  const [topicsOpen, setTopicsOpen] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const iconRef = React.useRef<HTMLButtonElement>(null);
  const repeatsRef = React.useRef<HTMLButtonElement>(null);
  const editTopicsRef = React.useRef<HTMLButtonElement>(null);
  const ids = {
    name: React.useId(),
    line: React.useId(),
    checklist: React.useId(),
    checklistLine: React.useId(),
    meal: React.useId(),
    mealLine: React.useId(),
    fill: React.useId(),
  };

  // The form opens once the day is read, and a fresh one each opening.
  React.useEffect(() => {
    if (!open) {
      dispatch({ type: "reset", form: null });
      setStep("fields");
      setFailed(false);
      setRepeatsOpen(false);
      return;
    }
    if (form !== null || day === null || start === null) return;
    const opened = openForm(
      {
        mode: start.mode,
        startsAt: startTime(start, day),
        endsAt: start.end,
        kind: start.kind,
      },
      day.scope,
    );
    dispatch({ type: "reset", form: { ...opened, ...preset?.fields } });
  }, [open, form, day, start, preset]);

  const ready = form !== null;

  // Focus the name with its text selected, so typing replaces the kind's.
  // The sheet's content mounts a frame or two after it opens, past the
  // dialog's own first focus, so this waits for the field.
  React.useEffect(() => {
    if (!ready || step !== "fields") return;
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
      field.select();
    };
    timer = window.setTimeout(focusName, 50);
    return () => window.clearTimeout(timer);
  }, [ready, step]);

  async function send(current: NewBlockForm) {
    if (!hasName(current) || sending) return;
    setSending(true);
    setFailed(false);
    try {
      const id = await add(current);
      onAdded(id, current);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  // A capture's staged list or add, once the sheet has slid in. The add
  // reads the form as it is then, through a ref.
  const sendNow = React.useRef(() => {});
  sendNow.current = () => {
    if (form !== null) void send(form);
  };
  const staged = React.useRef(false);
  React.useEffect(() => {
    if (!open) {
      staged.current = false;
      return;
    }
    if (!ready || staged.current || preset === undefined) return;
    staged.current = true;
    const timer = window.setTimeout(() => {
      if (preset.open === "repeats") setRepeatsOpen(true);
      if (preset.open === "custom") setStep("custom");
      if (preset.add) sendNow.current();
    }, CAPTURE_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [open, ready, preset]);

  const isTransition = start?.mode === "transition";
  const title = isTransition ? COPY.newTransition : COPY.newBlock;

  // It opens once the day is read, whole, so it slides in at its own height.
  if (form === null || day === null) return null;

  const set = (action: NewBlockAction) => {
    setFailed(false);
    dispatch(action);
  };

  const line = consequenceLine(form, day, failed);
  const named = hasName(form);
  const minutes = lengthMin(form);
  const colour = colourLine(form, day);
  const options = repeatOptions(day.scope.ruleDate);
  const repeats = repeatLabel(form, day.scope.ruleDate);
  const timed = !form.checklist;
  const kindRow = !isTransition && hasChecklist(form.kind);
  const mealRow = isTransition || form.kind === "break";
  const mealTopics = topics.query.data ?? [];

  const header =
    step !== "fields" ? (
      <span className="sr-only">{title}</span>
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
            {scopeLine(form, day)}
          </Text>
          <Text as="h2" variant="heading">
            {title}
          </Text>
        </div>
      </div>
    );

  const footer =
    step !== "fields" ? undefined : (
      <Button
        className={cn(
          "h-12 w-full",
          !named &&
            "bg-fill-muted text-muted-foreground hover:bg-fill-muted cursor-not-allowed",
        )}
        aria-disabled={named ? undefined : true}
        aria-describedby={ids.line}
        onClick={() => void send(form)}
      >
        {!named
          ? COPY.nameNeeded
          : isTransition
            ? COPY.addTransition
            : COPY.addBlock}
      </Button>
    );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
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
      {step === "custom" ? (
        <CustomRecurrenceStep
          caption={CUSTOM_RECURRENCE_COPY.caption(form.name, title)}
          backTo={form.name.trim() || title}
          startKey={day.scope.ruleDate}
          value={customForm(form, day.scope.ruleDate)}
          {...(form.checklist
            ? {}
            : { times: { startsAt: form.startsAt, endsAt: form.endsAt } })}
          usualWeek
          onBack={() => {
            setStep("fields");
            requestAnimationFrame(() => repeatsRef.current?.focus());
          }}
          onDone={(rule) => {
            set({
              type: "custom",
              rrule: buildRule(rule, day.scope.ruleDate),
              ruleDate: day.scope.ruleDate,
            });
            setStep("fields");
            requestAnimationFrame(() => repeatsRef.current?.focus());
          }}
        />
      ) : step === "icon" ? (
        <IconPickerStep
          name={form.name}
          value={form.icon}
          backLabel={COPY.iconBack(form.name.trim())}
          onBack={() => {
            setStep("fields");
            requestAnimationFrame(() => iconRef.current?.focus());
          }}
          onPick={(icon) => {
            set({ type: "icon", icon });
            setStep("fields");
          }}
          onRecolour={(icon) => set({ type: "icon", icon })}
        />
      ) : (
        <div className="flex flex-col">
          {isTransition ? null : (
            <KindPicker
              value={form.kind}
              onChange={(kind) => set({ type: "kind", kind })}
            />
          )}

          <div className="flex flex-col gap-(--space-2) pb-(--space-3)">
            <Text
              as="label"
              htmlFor={ids.name}
              variant="secondary"
              tone="secondary"
            >
              {COPY.name}
            </Text>
            <div className="flex items-center gap-(--space-2)">
              <button
                ref={iconRef}
                type="button"
                aria-label={COPY.icon(iconWord(form))}
                onClick={() => setStep("icon")}
                className={cn(
                  "border-input inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius) border",
                  "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                )}
              >
                {form.icon === null ? (
                  <NoIconIcon
                    aria-hidden="true"
                    className="text-muted-foreground size-5"
                  />
                ) : (
                  <ItemIcon icon={form.icon} size={24} />
                )}
              </button>
              <Input
                ref={nameRef}
                id={ids.name}
                value={form.name}
                maxLength={120}
                onChange={(event) =>
                  set({ type: "name", name: event.target.value })
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void send(form);
                  }
                }}
                classes={{ root: "min-w-0 flex-1" }}
              />
            </div>
          </div>

          {timed ? (
            <>
              <div className={ROW}>
                <Text as="span" variant="body" className="flex-1">
                  {COPY.starts}
                </Text>
                <div className="w-36 shrink-0">
                  <TimeField
                    label={<span className="sr-only">{COPY.starts}</span>}
                    value={form.startsAt}
                    formatValue={clock}
                    onChange={(startsAt) => set({ type: "starts", startsAt })}
                  />
                </div>
              </div>
              <div className={ROW}>
                <Text as="span" variant="body" className="flex-1">
                  {COPY.ends}
                </Text>
                <Text
                  as="span"
                  variant="secondary"
                  tone="secondary"
                  aria-hidden="true"
                  className="whitespace-nowrap"
                >
                  {lengthWords(minutes)}
                </Text>
                <div className="w-36 shrink-0">
                  <TimeField
                    label={
                      <span className="sr-only">
                        {COPY.endsName(clock(form.endsAt), minutes)}
                      </span>
                    }
                    value={form.endsAt === "24:00" ? "23:59" : form.endsAt}
                    formatValue={clock}
                    onChange={(endsAt) => set({ type: "ends", endsAt })}
                  />
                </div>
              </div>
            </>
          ) : null}

          {isTransition ? null : (
            <div className={ROW}>
              <Text as="span" variant="body" className="flex-1">
                {COPY.repeats.label}
              </Text>
              <Select
                // A custom rule picks no row, so Custom… always fires again.
                value={form.repeat === "custom" ? "" : form.repeat}
                open={repeatsOpen}
                onOpenChange={setRepeatsOpen}
                onValueChange={(next) => {
                  if (next === CUSTOM) {
                    setStep("custom");
                    return;
                  }
                  set({ type: "repeat", repeat: next as RepeatPreset });
                }}
              >
                <SelectTrigger
                  ref={repeatsRef}
                  aria-label={COPY.repeats.name(repeats)}
                  className="min-h-(--target) w-fit"
                >
                  <SelectValue>{repeats}</SelectValue>
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  align="end"
                  className="w-72"
                >
                  {options.map((option) => (
                    <SelectItem key={option.preset} value={option.preset}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value={CUSTOM}>{COPY.repeats.custom}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div
            className={cn(
              "flex min-h-(--row-min) items-center gap-(--space-3)",
              isTransition && ROW,
            )}
          >
            <Text as="span" variant="body" className="flex-1">
              {COPY.colour}
            </Text>
            <span
              role="img"
              aria-label={COPY.colourName(colour.text)}
              className="flex items-center gap-(--space-2)"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "ring-ink ring-offset-background size-5 rounded-full ring-1 ring-offset-2",
                  HUE_DOT[colour.hue],
                )}
              />
              <Text
                as="span"
                variant="secondary"
                tone="secondary"
                aria-hidden="true"
              >
                {colour.text}
              </Text>
            </span>
          </div>

          {kindRow ? (
            <SwitchRow
              id={ids.checklist}
              lineId={ids.checklistLine}
              label={COPY.checklist.label}
              line={form.checklist ? COPY.checklist.on : COPY.checklist.off}
              checked={form.checklist}
              onChange={(on) => set({ type: "checklist", on })}
            />
          ) : null}

          {!isTransition && form.kind === "work" ? (
            <div
              role="radiogroup"
              aria-labelledby={`${ids.fill}-label`}
              className="border-hairline flex flex-col gap-(--space-2) border-t py-(--space-3)"
            >
              <Text
                as="span"
                id={`${ids.fill}-label`}
                variant="body"
                weight={600}
              >
                {COPY.fill.label}
              </Text>
              {(
                [
                  ["tasks_for_the_day", COPY.fill.tasks, COPY.fill.tasksLine],
                  ["set_items", COPY.fill.set, COPY.fill.setLine],
                ] as const
              ).map(([value, label, text]) => (
                <label
                  key={value}
                  className={cn(
                    "flex cursor-pointer flex-col gap-(--space-1) rounded-(--radius) border p-(--space-3)",
                    "focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2",
                    form.fill === value ? "border-ink" : "border-hairline",
                  )}
                >
                  <input
                    type="radio"
                    name={ids.fill}
                    value={value}
                    checked={form.fill === value}
                    onChange={() => set({ type: "fill", fill: value })}
                    className="sr-only"
                  />
                  <Text as="span" variant="body" weight={500}>
                    {label}
                  </Text>
                  <Text as="span" variant="caption" tone="secondary">
                    {text}
                  </Text>
                </label>
              ))}
            </div>
          ) : null}

          {!isTransition && form.kind === "todos" ? (
            <Text
              as="p"
              variant="caption"
              tone="secondary"
              className="border-hairline border-t pt-(--space-3)"
            >
              {COPY.todosFill}
            </Text>
          ) : null}

          {mealRow ? (
            <SwitchRow
              id={ids.meal}
              lineId={ids.mealLine}
              label={COPY.meal.label}
              line={
                form.meal
                  ? isTransition
                    ? COPY.meal.transitionOn
                    : COPY.meal.blockOn
                  : isTransition
                    ? COPY.meal.transitionOff
                    : COPY.meal.blockOff
              }
              checked={form.meal}
              onChange={(on) => set({ type: "meal", on })}
            />
          ) : null}

          {mealRow && form.meal ? (
            <section
              aria-label={COPY.meal.watching}
              className="flex flex-col gap-(--space-2) pb-(--space-2)"
            >
              <div className="flex items-center justify-between gap-(--space-3)">
                <Text as="h3" variant="secondary" tone="secondary">
                  {COPY.meal.watching}
                </Text>
                <button
                  ref={editTopicsRef}
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setTopicsOpen(true)}
                  className="text-ink -me-(--space-2) inline-flex min-h-(--target) items-center rounded-(--radius-control) px-(--space-2) text-(length:--fs-caption) font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {COPY.meal.editTopics}
                </button>
              </div>
              <div className="flex flex-wrap gap-(--space-2)">
                {mealTopics.map((topic) => {
                  const on = form.topics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      aria-pressed={on}
                      aria-label={COPY.meal.offered(topic.name, on)}
                      onClick={() => set({ type: "topic", id: topic.id })}
                      className={cn(
                        "inline-flex h-9 items-center gap-(--space-2) rounded-full border px-(--space-3) text-(length:--fs-secondary)",
                        "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        on
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "border-hairline text-ink",
                      )}
                    >
                      {topic.icon === null ? null : (
                        <IconTile icon={topic.icon} variant="bare" />
                      )}
                      {topic.name}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <p
            id={ids.line}
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-center gap-(--space-2) pt-(--space-3)",
              (kindRow || mealRow) && !form.meal
                ? ""
                : "border-hairline border-t",
            )}
          >
            {line.kind === "error" ? (
              <>
                <NotSavedIcon
                  aria-hidden="true"
                  className="text-ink size-4 shrink-0"
                />
                <Text as="span" variant="secondary" tone="ink">
                  {line.text}{" "}
                  <button
                    type="button"
                    onClick={() => void send(form)}
                    className="inline-flex min-h-(--target) items-center font-medium underline underline-offset-4"
                  >
                    {COPY.tryAgain}
                  </button>
                </Text>
              </>
            ) : (
              <Text
                as="span"
                variant="secondary"
                tone={line.tone === "ink" ? "ink" : "secondary"}
              >
                {line.text}
              </Text>
            )}
          </p>
        </div>
      )}

      <MealTopicsSheet
        open={topicsOpen}
        onOpenChange={setTopicsOpen}
        returnFocusRef={editTopicsRef}
      />
    </ResponsiveSheet>
  );
}

/** The icon tile's word: the emoji, the glyph's name, or none. */
function iconWord(form: NewBlockForm): string | null {
  const { icon } = form;
  if (icon === null) return null;
  if (icon.kind === "emoji") return icon.value;
  if (icon.kind === "image") return "photo";
  return icon.value.replaceAll("-", " ");
}

function SwitchRow({
  id,
  lineId,
  label,
  line,
  checked,
  onChange,
}: {
  id: string;
  lineId: string;
  label: string;
  line: string;
  checked: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-t py-(--space-3)">
      <div className="flex min-w-0 flex-1 flex-col">
        <Text as="label" htmlFor={id} variant="body">
          {label}
        </Text>
        <Text as="span" id={lineId} variant="caption" tone="secondary">
          {line}
        </Text>
      </div>
      <Switch
        id={id}
        checked={checked}
        aria-describedby={lineId}
        onCheckedChange={onChange}
      />
    </div>
  );
}
