/**
 * Toaster — the one transient surface, and it exists for one job: undo.
 *
 * Official spec §9.7: "Toasts: bottom, one at a time, 4s, no icons; used for
 * undo affordances only." A toast that confirms a save the person can already
 * see on screen is noise; the button's label is the confirmation.
 *
 * WHY THESE SETTINGS
 *   visibleToasts=1  — a stack is a queue of things you missed.
 *   bottom-center    — the thumb is there, on both layouts. CC moves to
 *                      bottom-right on wide; Synapse does not, because the undo
 *                      target should not travel.
 *   duration=4000    — §9.7. The undo WINDOWS are longer (5s / 10s, from
 *                      @syn/constants) and are the row's business, not the
 *                      toast's; the toast is the notice, the row is the record.
 *   no icons, no close button — nothing here is a status.
 *
 * TOKEN BINDINGS: inverted surface — neutral-800 on light, neutral-100 on
 * dark, with the text inverted to match, so the toast reads as an overlay
 * rather than another card.
 */
"use client";

import { Toaster as Sonner, toast } from "sonner";

import { UNDO_SHORT_MS } from "@syn/constants";

import { cn } from "../../../lib/cn";

export type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ className, toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      visibleToasts={1}
      duration={4000}
      icons={{}}
      className={cn("toaster group", className)}
      toastOptions={{
        duration: 4000,
        classNames: {
          /*
           * Sonner injects its own `[data-sonner-toast]` rule with the same
           * specificity as a utility class and a later source order, so it
           * wins a tie. These are marked important to land on the element
           * Sonner is already styling — the one place in the package where
           * that is the right answer rather than a shortcut.
           */
          toast: cn(
            "group toast",
            "rounded-(--radius)!",
            "border-0!",
            "bg-neutral-800! text-neutral-50!",
            "dark:bg-neutral-100! dark:text-neutral-900!",
            "shadow-(--shadow-overlay)!",
          ),
          title: cn(
            "group-[.toast]:font-sans",
            "group-[.toast]:text-(length:--fs-secondary)",
          ),
          description: cn(
            "group-[.toast]:font-sans",
            "group-[.toast]:text-(length:--fs-caption)",
            "group-[.toast]:opacity-80",
          ),
          actionButton: cn(
            "bg-transparent!",
            "font-sans! font-medium!",
            "text-(length:--fs-secondary)!",
            "text-neutral-50! dark:text-neutral-900!",
            "underline underline-offset-4",
          ),
          ...toastOptions?.classNames,
        },
        ...toastOptions,
      }}
      {...props}
    />
  );
}

Toaster.displayName = "Toaster";

export interface ToastUndoOptions {
  /** What happened, in the past tense — "Applied Morning A". */
  text: string;
  onUndo: () => void;
  /** Defaults to the short undo window (5s), which is the common case. */
  durationMs?: number;
}

/**
 * The only toast helper the product needs. Everything else that would be a
 * toast is either already visible on the surface or belongs in a status line.
 */
function toastUndo({
  text,
  onUndo,
  durationMs = UNDO_SHORT_MS,
}: ToastUndoOptions) {
  return toast(text, {
    duration: durationMs,
    action: { label: "Undo", onClick: onUndo },
  });
}

export { Toaster, toast, toastUndo };
