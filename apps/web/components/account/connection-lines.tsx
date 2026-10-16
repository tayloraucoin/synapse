"use client";

/**
 * Connections' small parts (USE-85): the Add row of a section, and the ink
 * line with its alert glyph that a failed read, save or connect shows
 * (error.md, connecting.md). Never red; the line is announced politely.
 */
import { AddIcon, cn, NotSavedIcon, Spinner, Text } from "@syn/ui";
import { CONNECTIONS_COPY as COPY } from "./copy";

export type ConnectState = "idle" | "connecting" | "failed";

/** "Not saved." or "Calendars didn't load.", then an underlined Try again. */
export function InkLine({
  words,
  onRetry,
  className,
}: {
  words: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <p
      role="status"
      className={cn("flex items-center gap-(--space-2)", className)}
    >
      <NotSavedIcon aria-hidden="true" className="text-ink size-4 shrink-0" />
      <Text as="span" variant="secondary" tone="ink">
        {words}
      </Text>
      <button
        type="button"
        onClick={onRetry}
        className="text-ink focus-visible:ring-ring min-h-(--target) cursor-pointer text-(length:--fs-secondary) font-medium underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
      >
        {COPY.tryAgain}
      </button>
    </p>
  );
}

/**
 * "+ Add a Google account" or "+ Add a workspace" (48 px). Connecting, a
 * quiet spinner takes the plus's place and the words stay; it cannot be
 * tapped twice. Failed, "Not connected. Try again." sits under it. Offline
 * it is disabled, as connecting needs the provider.
 */
export function AddConnectionRow({
  label,
  state,
  disabled,
  onAdd,
}: {
  label: string;
  state: ConnectState;
  disabled: boolean;
  onAdd: () => void;
}) {
  const connecting = state === "connecting";
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={connecting ? undefined : onAdd}
        disabled={disabled}
        aria-disabled={connecting || undefined}
        aria-label={connecting ? COPY.connecting(label) : undefined}
        className={cn(
          "flex min-h-12 w-full items-center gap-(--space-3) rounded-(--radius-sm) text-start text-foreground",
          "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          "disabled:text-muted-foreground disabled:hover:bg-transparent",
          connecting && "cursor-default hover:bg-transparent",
        )}
      >
        {connecting ? (
          <Spinner aria-hidden="true" className="text-muted-foreground" />
        ) : (
          <AddIcon aria-hidden="true" className="size-4" />
        )}
        <Text as="span" variant="body" tone={disabled ? "muted" : "ink"}>
          {label}
        </Text>
      </button>
      {state === "failed" ? (
        <InkLine words={COPY.notConnected} onRetry={onAdd} />
      ) : null}
    </div>
  );
}
