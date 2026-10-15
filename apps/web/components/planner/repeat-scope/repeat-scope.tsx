"use client";

/**
 * RepeatScope (USE-47; custom-recurrence.md): a repeating block changed from
 * a dated day asks which dates take the change, as Google does, extending
 * D-USE-24's scoped menu: This one (first and focused: This week's default
 * is the date, C-USE-set-my-days-5), This and following, or All. Cancel or
 * Escape changes nothing. Asked only from a dated day; the usual week's
 * edits are every week's (C-USE-set-my-days-4).
 *
 * An AlertDialog over the day [ASSUMPTION: a dialog, not a sheet step: the
 * change comes from a drag on the column, where no sheet is open].
 */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Text,
} from "@syn/ui";
import { REPEAT_SCOPE_COPY as COPY, type RepeatScopeAnswer } from "./copy";

export interface RepeatScopeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "Move Wellness to 8:30?" */
  title: string;
  /** The block's name, for the body. */
  name: string;
  /** The date asked from, as its lines read it: "Thursday 15 October". */
  date: string;
  onAnswer: (scope: RepeatScopeAnswer) => void;
}

export function RepeatScope({
  open,
  onOpenChange,
  title,
  name,
  date,
  onAnswer,
}: RepeatScopeProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="motion-reduce:animate-none">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{COPY.body(name)}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-(--space-2)">
          {COPY.choices.map((choice, index) => (
            <AlertDialogAction
              key={choice.scope}
              variant={index === 0 ? "default" : "secondary"}
              // This one leads, and takes the focus as the dialog opens.
              autoFocus={index === 0}
              onClick={() => onAnswer(choice.scope)}
              className="h-auto min-h-(--target) w-full flex-col items-start gap-0 py-(--space-2) text-start"
            >
              <span>{choice.label}</span>
              <Text
                as="span"
                variant="caption"
                className="font-normal opacity-80"
              >
                {choice.line(date)}
              </Text>
            </AlertDialogAction>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{COPY.cancel}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
