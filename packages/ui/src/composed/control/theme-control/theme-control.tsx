/**
 * ThemeControl — the System / Light / Dark chooser (Epic 1 ST-09).
 *
 * Lives in `@syn/ui` rather than the app because two surfaces need it — the
 * Appearance setting and the Storybook toolbar — and because the future Expo
 * app re-skins it over the same `useAppTheme`.
 *
 * Three labelled rows, never three icons: official spec §9.9 — icons never
 * appear without a text label except the checkbox and the timer glyph.
 *
 * HYDRATION: the stored theme is only knowable on the client, so the server
 * render has no checked row. `useSyncExternalStore` returns the server
 * snapshot until hydration completes and then re-renders with the real
 * selection, which is a rendered fallback rather than a mismatch — writing the
 * checked state directly from `theme` would make the server and the client
 * disagree on a `checked` attribute.
 *
 * KEYBOARD: a real radio group, so the browser gives arrow-key roving focus
 * and Space selection for free. There is no roving tabindex to maintain, and
 * no keyboard handler to get wrong.
 *
 * Selection applies immediately; there is no save button (ST-09).
 */
"use client";

import * as React from "react";

import { useAppTheme } from "../../../hooks/use-theme";
import { cn } from "../../../lib/cn";
import { Caption, Text } from "../../../primitives/typography/text";
import { THEME_CONTROL_COPY, THEME_OPTIONS, type ThemeOption } from "./copy";

export interface ThemeControlProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  /**
   * Called with the chosen option AFTER the theme has been applied.
   *
   * The control still owns `setTheme` — the visible change must not wait on a
   * caller, and a control that only reported the choice would let one consumer
   * forget to apply it. ST-09 uses this to persist the choice to the account,
   * which is the cross-device source; the local store is the per-device cache.
   */
  onThemeChange?: (theme: ThemeOption) => void;
  className?: string;
}

/** No store to subscribe to — this only distinguishes server from client. */
const subscribeToNothing = () => () => {};

function useHasHydrated(): boolean {
  return React.useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

export function ThemeControl({
  label = THEME_CONTROL_COPY.label,
  helperText = THEME_CONTROL_COPY.helperText,
  onThemeChange,
  className,
}: ThemeControlProps) {
  const { theme, setTheme } = useAppTheme();
  const hasHydrated = useHasHydrated();
  const groupName = React.useId();
  const labelId = React.useId();
  const helperId = React.useId();

  const selected: ThemeOption | null = hasHydrated
    ? ((THEME_OPTIONS as readonly string[]).includes(theme ?? "")
        ? (theme as ThemeOption)
        : "system")
    : null;

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="span" id={labelId} variant="secondary" weight={500}>
        {label}
      </Text>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={helperId}
        className="flex flex-col"
      >
        {THEME_OPTIONS.map((option) => {
          const copy = THEME_CONTROL_COPY.options[option];
          const isSelected = selected === option;

          return (
            <label
              key={option}
              className={cn(
                "flex min-h-(--row-min) cursor-pointer items-center gap-(--space-3)",
                "border-hairline border-b px-(--space-1) py-(--space-2) last:border-b-0",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option}
                checked={isSelected}
                onChange={() => {
                  setTheme(option);
                  onThemeChange?.(option);
                }}
                // `--primary` is neutral-800 light / neutral-100 dark, which
                // is exactly the pair this needs — so no `dark:` variant.
                className="size-5 shrink-0 accent-(--primary)"
              />
              <span className="flex flex-col">
                <Text as="span" variant="body">
                  {copy.label}
                </Text>
                <Caption as="span">{copy.description}</Caption>
              </span>
            </label>
          );
        })}
      </div>

      <Caption as="span" id={helperId}>
        {helperText}
      </Caption>
    </div>
  );
}
