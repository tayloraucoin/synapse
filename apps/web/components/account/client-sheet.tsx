"use client";

/**
 * ClientSheet — a client's name, colour and letter tile, and what it covers
 * in Linear (USE-86; account/settings/states/client-sheet.md). Opened from
 * a client row, or empty from "Add a client".
 *
 * SIX COLOURS ONLY (D-USE-95): rose, leaf, amber, moss, slate, ink, a radio
 * group named by the colour words. Sky, plum and clay stay with Work, events
 * and firing and are never offered. The tile always carries its letter, so
 * colour is never alone.
 *
 * SAVE, AS DRAWN. Faded and inert until the name or colour changes (the
 * Profile sheet's Save, D-USE-37); × closes without saving. Linear is read
 * here and set from the workspace sheet.
 *
 * REMOVE MOVES, NEVER DELETES. Remove client archives it: its work resolves
 * to no client and shows under Personal, and the house Toaster's Undo brings
 * it back with its mappings and its place (C-USE-settings-client-sheet-2).
 * Nothing reaches Linear. A new client has no Remove row.
 *
 * Upload a logo is the uploaded-logos ticket's: until it lands the logo row
 * is the tile and its words, with nothing to press (out of scope).
 */
import * as React from "react";
import { CLIENT_COLOR_KEYS } from "@syn/constants";
import {
  Button,
  CloseIcon,
  cn,
  Input,
  NotSavedIcon,
  ResponsiveSheet,
  Text,
} from "@syn/ui";
import type { ClientRecord } from "@syn/validators";
import { ClientTile } from "@/components/work/client-tile";
import { CLIENTS_COPY } from "./copy";

const COPY = CLIENTS_COPY.client;

type ColourKey = ClientRecord["colorKey"];

/** Whole class names, so Tailwind sees every one. */
const SWATCH: Record<ColourKey, string> = {
  rose: "bg-category-rose-dot",
  leaf: "bg-category-leaf-dot",
  amber: "bg-category-amber-dot",
  moss: "bg-category-moss-dot",
  slate: "bg-category-slate-dot",
  ink: "bg-foreground",
};

export interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null: Add a client. */
  client: ClientRecord | null;
  /** What it covers in Linear: "Lighthouse: Patient portal, Records import". */
  covers: string;
  /** A new client's first colour: the first of the six not yet taken. */
  freeColour: ColourKey;
  onSave: (details: { name: string; colorKey: ColourKey }) => Promise<unknown>;
  onRemove: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function ClientSheet({
  open,
  onOpenChange,
  client: given,
  covers: givenCovers,
  freeColour,
  onSave,
  onRemove,
  returnFocusRef,
}: ClientSheetProps) {
  // The client stays drawn while the sheet closes, so it never flashes empty.
  const [kept, setKept] = React.useState({
    client: given,
    covers: givenCovers,
  });
  if (open && (kept.client !== given || kept.covers !== givenCovers)) {
    setKept({ client: given, covers: givenCovers });
  }
  const { client, covers } = open
    ? { client: given, covers: givenCovers }
    : kept;
  const [name, setName] = React.useState("");
  const [colour, setColour] = React.useState<ColourKey>(freeColour);
  const [notSaved, setNotSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const ids = { reason: React.useId(), line: React.useId() };

  // Each opening starts from the client as saved.
  React.useEffect(() => {
    if (!open) return;
    setName(client?.name ?? "");
    setColour(client?.colorKey ?? freeColour);
    setNotSaved(false);
    // A new client's name takes focus; an existing one's title does.
    const frame = requestAnimationFrame(() =>
      (client === null ? nameRef.current : titleRef.current)?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [open, client, freeColour]);

  const trimmed = name.trim();
  const changed =
    trimmed !== "" &&
    (client === null || trimmed !== client.name || colour !== client.colorKey);
  const letter = (
    trimmed.charAt(0) ||
    client?.name.charAt(0) ||
    "·"
  ).toUpperCase();

  async function save() {
    if (!changed || saving) return;
    setSaving(true);
    try {
      await onSave({ name: trimmed, colorKey: colour });
      onOpenChange(false);
    } catch {
      setNotSaved(true);
    } finally {
      setSaving(false);
    }
  }

  function onSwatchKey(event: React.KeyboardEvent, index: number) {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const keys = CLIENT_COLOR_KEYS;
    const next = keys[(index + step + keys.length) % keys.length]!;
    setColour(next);
    const group = event.currentTarget.parentElement;
    group?.querySelector<HTMLElement>(`[data-colour="${next}"]`)?.focus();
  }

  const header = (
    <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
      <Text
        ref={titleRef}
        as="h2"
        variant="heading"
        weight={600}
        tabIndex={-1}
        className="flex-1 outline-none"
      >
        {COPY.title}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        aria-label={CLIENTS_COPY.close}
        onClick={() => onOpenChange(false)}
        className="-me-(--space-3)"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
    </div>
  );

  const footer = (
    <div className="flex flex-col gap-(--space-4)">
      {notSaved ? (
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
        aria-disabled={changed ? undefined : true}
        aria-describedby={
          notSaved ? ids.line : changed ? undefined : ids.reason
        }
        onClick={() => void save()}
      >
        {COPY.save}
      </Button>
      <span id={ids.reason} className="sr-only">
        {COPY.nothingToSave}
      </span>
      {client !== null ? (
        <button
          type="button"
          aria-label={COPY.removeLabel(client.name)}
          onClick={onRemove}
          className="text-destructive-text self-start rounded-(--radius-sm) py-(--space-2) text-start text-(length:--fs-body) hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {COPY.remove}
        </button>
      ) : null}
    </div>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
      title={COPY.title}
      header={header}
      headerAction={null}
      footer={footer}
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        header: "items-center pt-(--space-2)",
        body: "pt-(--space-2)",
        footer: "border-t-0",
      }}
    >
      <div className="flex flex-col gap-(--space-6)">
        <div className="flex items-center gap-(--space-4)">
          <ClientTile letter={letter} hue={colour} size="lg" />
          <div className="flex flex-col">
            <Text as="p" variant="body" weight={600}>
              {COPY.upload}
            </Text>
            <Text as="p" variant="caption" tone="muted">
              {COPY.uploadLine}
            </Text>
          </div>
        </div>

        <Input
          ref={nameRef}
          label={COPY.name}
          value={name}
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
            setNotSaved(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") void save();
          }}
        />

        <div className="flex flex-col gap-(--space-2)">
          <Text as="p" id="client-colour" variant="secondary" weight={600}>
            {COPY.colour}
          </Text>
          <div
            role="radiogroup"
            aria-labelledby="client-colour"
            className="flex flex-wrap gap-(--space-1)"
          >
            {CLIENT_COLOR_KEYS.map((key, index) => {
              const picked = key === colour;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  data-colour={key}
                  aria-checked={picked}
                  aria-label={COPY.colours[key]}
                  tabIndex={picked ? 0 : -1}
                  onClick={() => {
                    setColour(key);
                    setNotSaved(false);
                  }}
                  onKeyDown={(event) => onSwatchKey(event, index)}
                  className="inline-flex size-(--target) items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full",
                      picked && "border-foreground border-2",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-full",
                        picked ? "size-6" : "size-9",
                        SWATCH[key],
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </div>
          <Text as="p" variant="caption" tone="muted">
            {COPY.colourLine}
          </Text>
        </div>

        <div className="border-border flex min-h-(--row-min) items-center gap-(--space-4) border-y py-(--space-2)">
          <Text as="span" variant="body" className="shrink-0">
            {COPY.linear}
          </Text>
          <Text
            as="span"
            variant="caption"
            tone="muted"
            className="flex-1 text-end"
          >
            {covers}
          </Text>
        </div>
      </div>
    </ResponsiveSheet>
  );
}
