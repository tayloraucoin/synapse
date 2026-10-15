"use client";

import * as React from "react";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  FiringMark,
  RadioGroup,
  RadioGroupItem,
  ResponsiveSheet,
  Text,
  useIsWide,
} from "@syn/ui";

/**
 * StartWhileOneRuns — the ask when Start meets an item in hand (USE-60;
 * start-while-one-runs.md, D-USE-43): "Start <title>", "One item is in hand
 * at a time. <running> is running; it moves to:", then Firing (selected,
 * with the small firing mark) and Paused with their lines, Cancel and Start.
 * Below 768 a bottom sheet over a dimmed Today; from 768 the same in a
 * centred Dialog, Enter for Start and Esc for Cancel (D-USE-65).
 *
 * The radios are one group named "Where <running> goes"; focus opens on the
 * selected one. Cancel, the scrim, Esc and a swipe down write nothing: the
 * caller's `onStart` is the only write. Props only.
 */
export type StartMoveTo = "firing" | "paused";

export interface StartWhileOneRunsProps {
  open: boolean;
  /** "Start [Appointment reminders: SMS copy]". */
  title: string;
  /** "One item is in hand at a time. <running> is running; it moves to:". */
  lead: string;
  /** "Where <running> goes". */
  groupName: string;
  options: Record<StartMoveTo, { word: string; line: string }>;
  cancel: string;
  start: string;
  onCancel: () => void;
  onStart: (moveTo: StartMoveTo) => void;
}

const ORDER: readonly StartMoveTo[] = ["firing", "paused"];

export function StartWhileOneRuns({
  open,
  title,
  lead,
  groupName,
  options,
  cancel,
  start,
  onCancel,
  onStart,
}: StartWhileOneRunsProps) {
  const isWide = useIsWide();
  const [moveTo, setMoveTo] = React.useState<StartMoveTo>("firing");
  // Firing is selected each time it opens (C-USE-start-while-one-runs-1).
  React.useEffect(() => {
    if (open) setMoveTo("firing");
  }, [open]);

  const choices = (
    <RadioGroup
      aria-label={groupName}
      value={moveTo}
      onValueChange={(value) => setMoveTo(value as StartMoveTo)}
      className="divide-border flex flex-col gap-0 divide-y"
    >
      {ORDER.map((key) => (
        <label
          key={key}
          className="flex min-h-11 cursor-pointer items-start gap-(--space-3) py-(--space-3)"
        >
          <RadioGroupItem
            value={key}
            aria-describedby={`start-ask-${key}`}
            className="mt-1 size-5 rounded-full"
          />
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-(--space-2)">
              {key === "firing" ? <FiringMark halo /> : null}
              <Text as="span" variant="body" weight={500}>
                {options[key].word}
              </Text>
            </span>
            <Text
              as="span"
              variant="secondary"
              tone="muted"
              id={`start-ask-${key}`}
            >
              {options[key].line}
            </Text>
          </span>
        </label>
      ))}
    </RadioGroup>
  );

  const buttons = (
    <div className="grid grid-cols-2 gap-(--space-3)">
      <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
        {cancel}
      </Button>
      <Button type="submit" size="lg">
        {start}
      </Button>
    </div>
  );

  // Enter submits: Start is the form's default (D-USE-65).
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onStart(moveTo);
  };
  const close = (next: boolean) => {
    if (!next) onCancel();
  };

  if (isWide)
    return (
      <Dialog open={open} onOpenChange={close}>
        <DialogContent showCloseButton={false} className="wide:max-w-[440px]">
          <form onSubmit={submit} className="flex flex-col gap-(--space-4)">
            <div className="flex flex-col gap-(--space-1)">
              <DialogTitle className="text-(length:--fs-heading) font-semibold">
                {title}
              </DialogTitle>
              <DialogDescription>{lead}</DialogDescription>
            </div>
            {choices}
            {buttons}
          </form>
        </DialogContent>
      </Dialog>
    );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={close}
      title={title}
      subtitle={lead}
      headerAction={null}
      initialFocus="first-field"
    >
      <form onSubmit={submit} className={cn("flex flex-col gap-(--space-4)")}>
        {choices}
        {buttons}
      </form>
    </ResponsiveSheet>
  );
}
