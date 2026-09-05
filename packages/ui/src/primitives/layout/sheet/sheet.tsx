/**
 * Sheet — the side container (cross-cutting §1.2).
 *
 * On wide it is the 420px right panel over a scrim; the compact bottom sheet
 * is Vaul's `drawer`, and `ResponsiveSheet` (a composed component, first
 * feature ticket) is what picks between them. `SheetPanel` at the bottom of
 * this file is the prop-based form.
 *
 * TOKEN BINDINGS: surface --paper, scrim --scrim, shadow --shadow-overlay,
 * width --sheet-w.
 *
 * A11y: Radix's focus trap, Esc-to-close, and focus-return are untouched.
 * Every sheet in the product relies on them; do not override.
 */
"use client"

import * as React from "react"
import { cn } from "../../../lib/cn"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-(--scrim) data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-(--space-4) bg-paper shadow-(--shadow-overlay) transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-(--sheet-w)",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-(--sheet-w)",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

/* ------------------------------------------------------------------ */

export interface SheetPanelClasses {
  content?: string;
  header?: string;
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
}

export interface SheetPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Announced on open. Required — a sheet without a name is a surprise. */
  title: string;
  description?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  /** Pinned above the safe area. */
  footer?: React.ReactNode;
  /** Suppresses the corner close when the header carries its own action. */
  hideClose?: boolean;
  children: React.ReactNode;
  classes?: SheetPanelClasses;
  className?: string;
}

/**
 * SheetPanel — the prop-based sheet, so a caller composes a header, a scrolling
 * body, and a pinned footer without re-deriving that layout each time.
 *
 * This is the primitive-level wrapper. `ResponsiveSheet` — the one API that
 * picks a Vaul drawer on compact and this panel on wide (v2 handoff §5.3) — is
 * a composed component and belongs to the first feature ticket that needs it.
 *
 * A11y: Radix's focus trap, Esc-to-close, and focus return are kept untouched.
 * Do not override them; every sheet in the product depends on that behaviour.
 */
function SheetPanel({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  footer,
  hideClose = false,
  children,
  classes,
  className,
}: SheetPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton={!hideClose}
        className={cn("flex flex-col gap-0 p-0", className, classes?.content)}
      >
        <SheetHeader className={cn("gap-(--space-1)", classes?.header)}>
          <SheetTitle className={classes?.title}>{title}</SheetTitle>
          {description ? (
            <SheetDescription className={classes?.description}>
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-(--space-4) py-(--space-3)",
            classes?.body,
          )}
        >
          {children}
        </div>

        {footer ? (
          <SheetFooter
            className={cn(
              "border-hairline border-t pb-[calc(var(--space-4)+env(safe-area-inset-bottom))]",
              classes?.footer,
            )}
          >
            {footer}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export { SheetPanel };
