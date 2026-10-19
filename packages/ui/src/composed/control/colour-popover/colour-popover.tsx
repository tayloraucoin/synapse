/**
 * ColourPopover — the custom colour, in the manner of Linear's picker
 * (D-USE-35): the colour as a swatch, a hex field, a saturation and
 * brightness area, and a hue slider. Drag or type; `onChange` follows every
 * valid colour so what it colours moves with it.
 *
 * A BAD HEX CHANGES NOTHING (N2). A field that is not a colour keeps the old
 * colour everywhere, takes an ink edge, and puts N2's words in place of the
 * helper, with an info icon. Never red: a typo is not an alarm.
 *
 * Closing darkens a very light pick a little so a line icon stays readable on
 * paper (the dev note), and hands back the colour it settled on.
 *
 * The area and the slider draw the colour space itself, so their gradients
 * are the one place in the package that names colours rather than tokens:
 * they are the control's content, not its skin.
 */
"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Input } from "../../../primitives/control/input";
import { HelperText } from "../../../primitives/display/helper-text";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "../../../primitives/feedback/popover";
import { Text } from "../../../primitives/typography/text";
import {
  displayHex,
  hexToHsv,
  hsvToHex,
  parseHex,
  readableOnPaper,
  type Hsv,
} from "./colour-maths";

export const BAD_HEX_WORDS =
  "Not a colour. Try 6 characters, like 2F6F62. The colour stays as it was.";

export interface ColourPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The row it opens under; it takes that row's width. */
  children: React.ReactNode;
  /** The colour now, `#rrggbb`. */
  value: string;
  /** Every valid colour, as it moves. */
  onChange: (hex: string) => void;
  /** The colour it closed on, darkened if it was too light for paper. */
  onDone?: (hex: string) => void;
  title?: React.ReactNode;
  helper: React.ReactNode;
  footer?: React.ReactNode;
  /** The field's text when it opens; the bad-hex state opens on a typo. */
  defaultHexText?: string;
  className?: string;
}

const SATURATION_LAYERS =
  "linear-gradient(to top, black, transparent), linear-gradient(to right, white, transparent)";
const HUE_SPECTRUM = `linear-gradient(to bottom, ${[
  0, 60, 120, 180, 240, 300, 360,
]
  .map((h) => `hsl(${h} 100% 50%)`)
  .join(", ")})`;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

function isBadHex(text: string, settled: boolean): boolean {
  const bare = text.trim().replace(/^#/, "");
  if (bare === "" || parseHex(bare) !== null) return false;
  return settled || /[^0-9a-f]/i.test(bare) || bare.length > 6;
}

/** Pointer drags on a box, as fractions of its width and height. */
function useDrag(onMove: (x: number, y: number) => void) {
  const onPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.type === "pointerdown") {
      event.currentTarget.setPointerCapture(event.pointerId);
    } else if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }
    const box = event.currentTarget.getBoundingClientRect();
    onMove(
      clamp((event.clientX - box.left) / box.width),
      clamp((event.clientY - box.top) / box.height),
    );
  };
  return { onPointerDown: onPointer, onPointerMove: onPointer };
}

export function ColourPopover({
  open,
  onOpenChange,
  children,
  value,
  onChange,
  onDone,
  title,
  helper,
  footer,
  defaultHexText,
  className,
}: ColourPopoverProps) {
  const [hsv, setHsv] = React.useState<Hsv>(() => hexToHsv(value));
  const [hexText, setHexText] = React.useState(
    () => defaultHexText ?? displayHex(value),
  );
  const [settled, setSettled] = React.useState(false);
  const hexId = React.useId();
  const helperId = React.useId();

  // A colour set from outside (a swatch, an edit) moves the controls; the
  // hue is kept when the new colour has none, so grey does not reset it.
  const emitted = React.useRef(value);
  React.useEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    const next = hexToHsv(value);
    setHsv((prev) => (next.s === 0 ? { ...next, h: prev.h } : next));
    setHexText((prev) =>
      parseHex(prev) === null && prev !== "" ? prev : displayHex(value),
    );
  }, [value]);

  const bad = isBadHex(hexText, settled);

  function apply(next: Hsv) {
    setHsv(next);
    const hex = hsvToHex(next);
    setHexText(displayHex(hex));
    setSettled(false);
    emitted.current = hex;
    onChange(hex);
  }

  function onHexChange(text: string) {
    setHexText(text);
    setSettled(false);
    const hex = parseHex(text);
    if (hex === null) return;
    const next = hexToHsv(hex);
    setHsv((prev) => (next.s === 0 ? { ...next, h: prev.h } : next));
    emitted.current = hex;
    onChange(hex);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      const readable = readableOnPaper(value);
      if (readable !== value) onChange(readable);
      onDone?.(readable);
      setSettled(false);
    }
    onOpenChange(next);
  }

  const area = useDrag((x, y) => apply({ ...hsv, s: x, v: 1 - y }));
  const hue = useDrag((_, y) => apply({ ...hsv, h: Math.min(359.9, y * 360) }));

  function onAreaKey(event: React.KeyboardEvent) {
    const step = event.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, Partial<Hsv>> = {
      ArrowLeft: { s: clamp(hsv.s - step) },
      ArrowRight: { s: clamp(hsv.s + step) },
      ArrowUp: { v: clamp(hsv.v + step) },
      ArrowDown: { v: clamp(hsv.v - step) },
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    apply({ ...hsv, ...move });
  }

  function onHueKey(event: React.KeyboardEvent) {
    const step = event.shiftKey ? 30 : 5;
    const delta =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? step
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? -step
          : 0;
    if (delta === 0) return;
    event.preventDefault();
    apply({ ...hsv, h: (hsv.h + delta + 360) % 360 });
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(
          "flex w-(--radix-popover-trigger-width) flex-col gap-(--space-3) motion-reduce:animate-none",
          className,
        )}
      >
        {title ? (
          <Text as="h3" variant="secondary" weight={600}>
            {title}
          </Text>
        ) : null}

        <div className="flex items-center gap-(--space-3)">
          <span
            aria-hidden="true"
            className="border-hairline block size-8 shrink-0 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <div className="relative min-w-0 flex-1">
            <label
              htmlFor={hexId}
              className="text-text-secondary pointer-events-none absolute start-(--space-3) top-1/2 z-10 -translate-y-1/2 text-(length:--fs-secondary)"
            >
              Hex #
            </label>
            <Input
              id={hexId}
              value={hexText}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={7}
              aria-invalid={bad || undefined}
              aria-describedby={helperId}
              onChange={(event) => onHexChange(event.target.value)}
              onBlur={() => setSettled(true)}
              classes={{
                input: cn(
                  "ps-(--space-12) uppercase",
                  bad && "border-ink hover:border-ink",
                ),
              }}
            />
          </div>
        </div>

        <div className="flex gap-(--space-3)">
          <div
            role="slider"
            tabIndex={0}
            aria-label="Saturation and brightness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(hsv.s * 100)}
            aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
            onKeyDown={onAreaKey}
            {...area}
            className="relative h-40 flex-1 cursor-crosshair touch-none rounded-(--radius)"
            style={{
              backgroundColor: `hsl(${hsv.h} 100% 50%)`,
              backgroundImage: SATURATION_LAYERS,
            }}
          >
            <span
              aria-hidden="true"
              className="border-paper pointer-events-none absolute block size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
            />
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Hue"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(hsv.h)}
            onKeyDown={onHueKey}
            {...hue}
            className="relative h-40 w-3 shrink-0 cursor-row-resize touch-none rounded-(--radius)"
            style={{ backgroundImage: HUE_SPECTRUM }}
          >
            <span
              aria-hidden="true"
              className="bg-paper border-hairline pointer-events-none absolute -inset-x-0.5 block h-1.5 -translate-y-1/2 rounded-(--radius) border"
              style={{ top: `${(hsv.h / 360) * 100}%` }}
            />
          </div>
        </div>

        {bad ? (
          <HelperText
            id={helperId}
            error
            className="flex items-start gap-(--space-2)"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{BAD_HEX_WORDS}</span>
          </HelperText>
        ) : (
          <HelperText id={helperId}>{helper}</HelperText>
        )}

        {footer}
      </PopoverContent>
    </Popover>
  );
}
