/**
 * useAppTheme — thin wrapper around next-themes' useTheme.
 *
 * Provides a stable API for reading and setting the current theme.
 * `isDarkMode` derives from `resolvedTheme` so it reflects the system
 * preference when the stored choice is "system".
 *
 * Must be used inside a ThemeProvider tree.
 */
"use client";

import { useTheme } from "next-themes";

export function useAppTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDarkMode = resolvedTheme === "dark";

  function setIsDarkMode(dark: boolean) {
    setTheme(dark ? "dark" : "light");
  }

  function toggleDarkMode() {
    setTheme(isDarkMode ? "light" : "dark");
  }

  return {
    /** "system" | "light" | "dark" — the explicitly set preference */
    theme,
    setTheme,
    /** true when the resolved (system-aware) theme is dark */
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
  };
}
