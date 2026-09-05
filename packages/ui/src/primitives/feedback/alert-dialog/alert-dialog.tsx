/**
 * AlertDialog — the two-action confirmation (`role="alertdialog"`).
 *
 * `ConfirmDialog` at the bottom of this file is the prop-based form every
 * archive, delete, remove, sign-out, discard, and ST-10a surface uses.
 * `confirmLabel` and `cancelLabel` have no defaults on purpose: official spec
 * §10.3 requires a verb that names the outcome, and "Confirm" names nothing.
 *
 * A11y: initial focus lands on cancel, not confirm — the safe action should be
 * the one a stray Return key hits.
 */
"use client"

import * as React from "react"
import { cn } from "../../../lib/cn"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { Button } from "../../control/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-(--scrim) data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-(--space-4) rounded-(--radius-sheet) border-hairline border bg-paper p-(--space-5) shadow-(--shadow-overlay) duration-200 data-[size=sm]:max-w-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:max-w-[320px] data-[size=default]:wide:max-w-[420px]",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-16 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size" | "busy">) {
  const { busy, ...actionProps } = props as typeof props & { busy?: boolean }
  return (
    <AlertDialogPrimitive.Action asChild {...actionProps}>
      <Button
        data-slot="alert-dialog-action"
        variant={variant}
        size={size}
        busy={busy}
        className={cn(className)}
      >
        {children}
      </Button>
    </AlertDialogPrimitive.Action>
  )
}

function AlertDialogCancel({
  className,
  variant = "secondary",
  size = "md",
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <AlertDialogPrimitive.Cancel asChild {...props}>
      <Button
        data-slot="alert-dialog-cancel"
        variant={variant}
        size={size}
        className={cn(className)}
      >
        {children}
      </Button>
    </AlertDialogPrimitive.Cancel>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}

/* ------------------------------------------------------------------ */

export interface ConfirmDialogClasses {
  content?: string;
  header?: string;
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
}

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  /** Always a verb that names the outcome (official spec §10.3). No default. */
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel?: () => void;
  /** `destructive` is Delete account (ST-10a) and nothing else. */
  variant?: "default" | "destructive";
  confirmDisabled?: boolean;
  /** Disables both actions and spins the confirm. */
  busy?: boolean;
  /** Rendered between the description and the footer — the typed-confirm input. */
  children?: React.ReactNode;
  classes?: ConfirmDialogClasses;
  className?: string;
}

/**
 * ConfirmDialog — two actions, one decision.
 *
 * `confirmLabel` and `cancelLabel` are required and have no defaults, because
 * "Confirm" tells a person nothing about what is about to happen. The label
 * names the outcome and matches the toast that follows it.
 *
 * Initial focus is on cancel: the safe action is the one a stray Return hits.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = "default",
  confirmDisabled = false,
  busy = false,
  children,
  classes,
  className,
}: ConfirmDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(className, classes?.content)}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        <AlertDialogHeader className={classes?.header}>
          <AlertDialogTitle className={classes?.title}>
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className={classes?.description}>
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        {children ? <div className={classes?.body}>{children}</div> : null}

        <AlertDialogFooter className={classes?.footer}>
          <AlertDialogCancel ref={cancelRef} disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={variant}
            busy={busy}
            disabled={confirmDisabled || busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ConfirmDialog };
