/**
 * The Appearance control's strings — Epic 1 ST-09.
 *
 * Register: a noun, a time, or a verb in the imperative. No "you" where a
 * plain statement works, no adjectives, no exclamation.
 */
export const THEME_CONTROL_COPY = {
  label: "Appearance",
  helperText: "Follows your device unless you choose.",
  options: {
    system: {
      label: "System",
      description: "Match the device",
    },
    light: {
      label: "Light",
      description: "Always light",
    },
    dark: {
      label: "Dark",
      description: "Always dark",
    },
  },
} as const;

export const THEME_OPTIONS = ["system", "light", "dark"] as const;

export type ThemeOption = (typeof THEME_OPTIONS)[number];
