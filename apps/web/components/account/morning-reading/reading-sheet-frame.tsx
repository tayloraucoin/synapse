"use client";

/**
 * ReadingSheetFrame — the shell both Morning reading sheets share (USE-153;
 * D-USE-126, D-USE-128, D-USE-129): × and the title, the fields, and above
 * Save the one line the moment needs.
 *
 * - A failed save: "Not saved. …" in ink with its icon; Save is the retry,
 *   with no second Try again (save-failed.md).
 * - Offline: the `StatusLine` above Save, and Save waits (offline-sheet.md).
 * - × , Escape, the scrim or a drag down: with unsaved words, `DiscardDialog`
 *   asks first (Keep editing, Discard); with none the sheet just closes.
 *
 * Save waits, faded and `aria-disabled` with its reason, until there are
 * words and while offline; it never hides. Focus goes to the title on open
 * and back to the row or add row that opened the sheet on close.
 */
import * as React from "react";
import {
  Button,
  CloseIcon,
  cn,
  DiscardDialog,
  NotSavedIcon,
  ResponsiveSheet,
  Text,
} from "@syn/ui";
import { OfflineLine } from "@/components/planner/offline-line";
import { READING_SHEET_COPY as COPY } from "./sheet-copy";
import type { SheetCheck } from "./use-reading-sheet";

/** A capture's start: the words as typed, then Save or a close pressed. */
export interface ReadingSheetSeed<D> {
  draft?: Partial<D>;
  then?: "save" | "close";
}

/** What the frame reads from `useReadingSheet`. */
export interface ReadingSheetHandle<D> {
  edit: (patch: Partial<D>) => void;
  failed: boolean;
  saving: boolean;
  discarding: boolean;
  canSave: boolean;
  hasWords: boolean;
  line: SheetCheck<unknown> | null;
  save: () => Promise<unknown>;
  requestClose: () => void;
  keepEditing: () => void;
  discard: () => void;
}

export interface ReadingSheetFrameProps<D> {
  open: boolean;
  title: string;
  /** The passage sheet: near full height, the editor filling it. */
  tall?: boolean;
  sheet: ReadingSheetHandle<D>;
  offline: boolean;
  /** The discard question's second line. */
  discardLine: string;
  seed?: ReadingSheetSeed<D>;
  children: React.ReactNode;
}

export function ReadingSheetFrame<D>({
  open,
  title,
  tall = false,
  sheet,
  offline,
  discardLine,
  seed,
  children,
}: ReadingSheetFrameProps<D>) {
  const ids = { line: React.useId(), reason: React.useId() };
  const pressed = React.useRef(false);

  // A capture's start: its words are in the draft already; press what it pressed, once.
  React.useEffect(() => {
    if (!open || seed?.then === undefined || pressed.current) return;
    pressed.current = true;
    if (seed.then === "save") void sheet.save();
    if (seed.then === "close") sheet.requestClose();
  });

  const waits = !sheet.canSave;

  const header = (
    <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.close}
        onClick={sheet.requestClose}
        className="-ms-(--space-3)"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <Text
        as="h2"
        variant="heading"
        weight={600}
        tabIndex={-1}
        className="flex-1 outline-none"
      >
        {title}
      </Text>
    </div>
  );

  const footer = (
    <div className="flex flex-col gap-(--space-4)">
      {offline ? (
        <div className="-mx-(--space-4)">
          <OfflineLine text={COPY.offline} />
        </div>
      ) : sheet.failed ? (
        <div
          id={ids.line}
          role="status"
          className="text-foreground flex items-center gap-(--space-2)"
        >
          <NotSavedIcon aria-hidden="true" className="size-4 shrink-0" />
          <Text as="span" variant="secondary">
            {COPY.notSaved}
          </Text>
        </div>
      ) : null}
      <Button
        className="w-full aria-disabled:opacity-40"
        aria-disabled={waits ? true : undefined}
        aria-busy={sheet.saving ? true : undefined}
        aria-describedby={
          sheet.failed && !offline
            ? ids.line
            : waits && !sheet.hasWords
              ? ids.reason
              : undefined
        }
        onClick={() => void sheet.save()}
      >
        {COPY.save}
      </Button>
      <span id={ids.reason} className="sr-only">
        {COPY.waits}
      </span>
    </div>
  );

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          if (!next) sheet.requestClose();
        }}
        title={title}
        header={header}
        headerAction={null}
        footer={footer}
        size="tall"
        classes={{
          content: tall
            ? "data-[vaul-drawer-direction=bottom]:h-[90dvh]"
            : undefined,
          header: "items-center pt-(--space-2)",
          body: "flex flex-col gap-(--space-6) pt-(--space-2)",
          footer: cn("border-t-0", offline && "pt-0"),
        }}
      >
        {children}
      </ResponsiveSheet>
      <DiscardDialog
        open={sheet.discarding}
        description={discardLine}
        onKeepEditing={sheet.keepEditing}
        onDiscard={sheet.discard}
      />
    </>
  );
}
