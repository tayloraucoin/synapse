/**
 * The Icon tab's two colour rows (USE-11; D-USE-35, D-USE-36):
 *
 * - **Colour**: the eight kind colours, a hairline rule, and the custom
 *   swatch that opens `ColourPopover`. The label's right end names what is
 *   picked and where it lives ("Saved · #2F6F62", "Custom · #2F6F62").
 * - **Saved**: past custom picks, newest first, and "Edit" at the row's end,
 *   so editing is never a hidden gesture. Edit mode puts × on each swatch;
 *   tapping one opens "Edit saved colour". A long press is the shortcut.
 *
 * Colour never alone: every swatch's accessible name is its word or its hex.
 */
"use client";

import * as React from "react";
import { Trash2, X } from "lucide-react";
import type { CategoryKey } from "@syn/types";
import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { HelperText } from "../../../primitives/display/helper-text";
import { Separator } from "../../../primitives/layout/separator";
import { Text } from "../../../primitives/typography/text";
import { ColourPopover, displayHex } from "../colour-popover";

/** Static so Tailwind's scanner emits all eight — see ColorSwatchRow. */
export const KIND_SWATCH: Record<CategoryKey, string> = {
  leaf: "bg-category-leaf-dot",
  sky: "bg-category-sky-dot",
  clay: "bg-category-clay-dot",
  rose: "bg-category-rose-dot",
  amber: "bg-category-amber-dot",
  slate: "bg-category-slate-dot",
  plum: "bg-category-plum-dot",
  moss: "bg-category-moss-dot",
};

export const KIND_INK: Record<CategoryKey, string> = {
  leaf: "text-category-leaf-dot",
  sky: "text-category-sky-dot",
  clay: "text-category-clay-dot",
  rose: "text-category-rose-dot",
  amber: "text-category-amber-dot",
  slate: "text-category-slate-dot",
  plum: "text-category-plum-dot",
  moss: "text-category-moss-dot",
};

/** The kind colours by the words the boards use. */
export const KIND_NAME: Record<CategoryKey, string> = {
  leaf: "Green",
  sky: "Blue",
  clay: "Clay",
  rose: "Rose",
  amber: "Ochre",
  slate: "Slate",
  plum: "Violet",
  moss: "Olive",
};

export const KINDS = Object.keys(KIND_SWATCH) as CategoryKey[];

export function isKind(colour: string): colour is CategoryKey {
  return Object.hasOwn(KIND_SWATCH, colour);
}

/** The wheel on the custom swatch draws the colour space itself. */
const WHEEL =
  "conic-gradient(hsl(0 70% 60%), hsl(60 70% 60%), hsl(120 70% 50%), hsl(180 70% 50%), hsl(240 70% 60%), hsl(300 70% 60%), hsl(360 70% 60%))";

const LONG_PRESS_MS = 450;

export const COLOUR_WORDS = {
  colour: "Colour",
  saved: "Saved",
  edit: "Edit",
  done: "Done",
  editing: "Tap a colour to change it; × removes it",
  savedValue: (hex: string) => `Saved · #${displayHex(hex)}`,
  customValue: (hex: string) => `Custom · #${displayHex(hex)}`,
  custom: "Custom colour",
  customHelper:
    "Drag to pick, or type a hex. A colour picked here joins Saved, on every device, so the next item can reuse it exactly. Very light picks are darkened a little so the icon stays readable on paper.",
  editTitle: "Edit saved colour",
  editHelper:
    "Changes this saved colour and every item that uses it, with Undo in the toast.",
  remove: "Remove from Saved",
  removeHelper: "Items already in it keep their colour. Undo in the toast.",
};

export interface SavedColour {
  id: string;
  /** `#rrggbb`, lower case. */
  hex: string;
}

export type ColourPanel =
  { kind: "custom" } | { kind: "edit"; id: string } | null;

export interface IconColourRowsProps {
  /** A kind key or `#rrggbb`. */
  colour: string;
  onColour: (colour: string) => void;
  /** The custom popover closed on this colour. */
  onCustomDone: (hex: string) => void;
  saved: readonly SavedColour[];
  onUpdateSaved: (id: string, hex: string) => void;
  onRemoveSaved: (id: string) => void;
  panel: ColourPanel;
  onPanel: (panel: ColourPanel) => void;
  editing: boolean;
  onEditing: (editing: boolean) => void;
  /** The hex field's text when a panel opens (the bad-hex state). */
  hexText?: string;
  /** Where the custom swatch starts when the colour is a kind. */
  customStart: string;
}

export function IconColourRows({
  colour,
  onColour,
  onCustomDone,
  saved,
  onUpdateSaved,
  onRemoveSaved,
  panel,
  onPanel,
  editing,
  onEditing,
  hexText,
  customStart,
}: IconColourRowsProps) {
  const savedHit = saved.find((s) => s.hex === colour);
  const customPicked =
    !isKind(colour) && (panel?.kind === "custom" || !savedHit);
  const editTarget =
    panel?.kind === "edit" ? saved.find((s) => s.id === panel.id) : undefined;
  const [editDraft, setEditDraft] = React.useState<string | null>(null);

  const rightLabel = editing
    ? COLOUR_WORDS.editing
    : isKind(colour)
      ? KIND_NAME[colour]
      : customPicked
        ? COLOUR_WORDS.customValue(colour)
        : COLOUR_WORDS.savedValue(colour);

  const press = useLongPress();

  function openEdit(id: string) {
    setEditDraft(null);
    onPanel({ kind: "edit", id });
  }

  return (
    <div className="flex flex-col gap-(--space-2)">
      <ColourPopover
        open={panel?.kind === "custom"}
        onOpenChange={(open) => onPanel(open ? { kind: "custom" } : null)}
        value={isKind(colour) ? customStart : colour}
        onChange={onColour}
        onDone={onCustomDone}
        helper={COLOUR_WORDS.customHelper}
        defaultHexText={panel?.kind === "custom" ? hexText : undefined}
      >
        <div className="flex flex-col gap-(--space-1)">
          <div className="flex items-baseline justify-between gap-(--space-3)">
            <Text as="span" variant="secondary" weight={600}>
              {COLOUR_WORDS.colour}
            </Text>
            <Text as="span" variant="caption" tone="muted" aria-live="polite">
              {rightLabel}
            </Text>
          </div>
          <div
            role="radiogroup"
            aria-label={COLOUR_WORDS.colour}
            className="-mx-(--space-1) flex items-center"
          >
            {KINDS.map((key) => (
              <Swatch
                key={key}
                label={KIND_NAME[key]}
                selected={colour === key}
                onSelect={() => onColour(key)}
                className={KIND_SWATCH[key]}
                fill
              />
            ))}
            <span
              aria-hidden="true"
              className="bg-hairline mx-(--space-1) h-6 w-px shrink-0"
            />
            <Swatch
              label={COLOUR_WORDS.custom}
              selected={customPicked}
              onSelect={() => onPanel({ kind: "custom" })}
              style={{ backgroundImage: WHEEL }}
              fill
            >
              {customPicked ? (
                <span
                  aria-hidden="true"
                  className="border-paper block size-3 rounded-full border-2"
                  style={{ backgroundColor: colour }}
                />
              ) : null}
            </Swatch>
          </div>
        </div>
      </ColourPopover>

      {saved.length === 0 ? null : (
        <ColourPopover
          open={editTarget !== undefined}
          onOpenChange={(open) => {
            if (open || !editTarget) return;
            onPanel(null);
          }}
          value={editDraft ?? editTarget?.hex ?? customStart}
          onChange={setEditDraft}
          onDone={(hex) => {
            if (editTarget && hex !== editTarget.hex) {
              onUpdateSaved(editTarget.id, hex);
            }
            setEditDraft(null);
          }}
          title={COLOUR_WORDS.editTitle}
          helper={COLOUR_WORDS.editHelper}
          defaultHexText={panel?.kind === "edit" ? hexText : undefined}
          footer={
            <>
              <Separator />
              <div className="flex flex-col gap-(--space-1)">
                <Button
                  variant="ghost"
                  className="-ms-(--space-4) justify-start gap-(--space-2) self-start"
                  onClick={() => {
                    if (!editTarget) return;
                    onRemoveSaved(editTarget.id);
                    setEditDraft(null);
                    onPanel(null);
                  }}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  {COLOUR_WORDS.remove}
                </Button>
                <HelperText>{COLOUR_WORDS.removeHelper}</HelperText>
              </div>
            </>
          }
        >
          <div className="flex items-center gap-(--space-2)">
            <Text
              as="span"
              variant="caption"
              tone="muted"
              className="w-12 shrink-0"
            >
              {COLOUR_WORDS.saved}
            </Text>
            <div
              role="radiogroup"
              aria-label={COLOUR_WORDS.saved}
              className="flex min-w-0 flex-1 items-center overflow-x-auto"
            >
              {saved.map((entry) => {
                const shown =
                  editTarget?.id === entry.id && editDraft
                    ? editDraft
                    : entry.hex;
                return (
                  <div key={entry.id} className="relative shrink-0">
                    <Swatch
                      label={`#${displayHex(shown)}`}
                      selected={
                        editTarget
                          ? editTarget.id === entry.id
                          : !customPicked && colour === entry.hex
                      }
                      onSelect={() =>
                        editing ? openEdit(entry.id) : onColour(entry.hex)
                      }
                      style={{ backgroundColor: shown }}
                      {...press(() => openEdit(entry.id))}
                    />
                    {editing ? (
                      <button
                        type="button"
                        aria-label={`Remove #${displayHex(entry.hex)} from Saved`}
                        onClick={() => onRemoveSaved(entry.id)}
                        className="bg-ink text-paper absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full"
                      >
                        <X
                          aria-hidden="true"
                          className="size-3"
                          strokeWidth={3}
                        />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={() => onEditing(!editing)}
            >
              {editing ? COLOUR_WORDS.done : COLOUR_WORDS.edit}
            </Button>
          </div>
        </ColourPopover>
      )}
    </div>
  );
}

interface SwatchProps extends Omit<
  React.ComponentProps<"button">,
  "onSelect" | "children"
> {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** Share the row's width: nine swatches and a rule fit a phone. */
  fill?: boolean;
  children?: React.ReactNode;
}

function Swatch({
  label,
  selected,
  onSelect,
  className,
  style,
  fill = false,
  children,
  ...props
}: SwatchProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      className={cn(
        "flex h-(--target) items-center justify-center rounded-(--radius)",
        fill ? "max-w-(--target) min-w-0 flex-1" : "w-(--target) shrink-0",
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-7 items-center justify-center rounded-full",
          selected && "ring-ink ring-2 ring-offset-2 ring-offset-(--paper)",
          className,
        )}
        style={style}
      >
        {children}
      </span>
    </button>
  );
}

/** A long press as a shortcut; the click that ends it is swallowed. */
function useLongPress() {
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = React.useRef(false);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (onLongPress: () => void) => ({
    onPointerDown: () => {
      fired.current = false;
      timer.current = setTimeout(() => {
        fired.current = true;
        onLongPress();
      }, LONG_PRESS_MS);
    },
    onPointerUp: () => {
      if (timer.current) clearTimeout(timer.current);
    },
    onPointerLeave: () => {
      if (timer.current) clearTimeout(timer.current);
    },
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
    onClickCapture: (event: React.MouseEvent) => {
      if (fired.current) {
        event.stopPropagation();
        event.preventDefault();
        fired.current = false;
      }
    },
  });
}

export { useLongPress, LONG_PRESS_MS };
