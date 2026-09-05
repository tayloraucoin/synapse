/**
 * ThemeProvider — wraps next-themes with Synapse's defaults.
 *
 * `attribute="class"` puts `dark` on `<html>`, which is what
 * `@custom-variant dark (&:is(.dark, .dark *))` and every `.dark` token
 * override in `preset.css` are written against. The root element carries
 * `suppressHydrationWarning` (set in the app's layout, INF-7) because
 * next-themes writes that class before React hydrates.
 *
 * `storageKey` is namespaced (`syn:theme`) rather than next-themes' bare
 * "theme": localhost is one origin, and an unrelated app in development must
 * not be able to hand Synapse a theme.
 *
 * `enableColorScheme` stays at its default (on), so form controls and
 * scrollbars follow the theme. Synapse has no light-scoped subtree to protect
 * from that.
 *
 * Usage (apps/web/app/layout.tsx):
 *   <html suppressHydrationWarning>
 *     <body>
 *       <ThemeProvider>{children}</ThemeProvider>
 *     </body>
 *   </html>
 */
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

import { STORAGE_KEYS } from "@syn/constants";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={STORAGE_KEYS.THEME}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
