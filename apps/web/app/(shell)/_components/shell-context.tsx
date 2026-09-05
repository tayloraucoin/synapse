"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * The shell's small shared state: is a sheet open, and how deep in the app is
 * this history.
 *
 * CONTEXT, NOT ZUSTAND — `lib/stores/README.md`'s rule read literally. Both
 * facts change at human frequency (a sheet opens; a route pushes), and the
 * tree that consumes them is the chrome, not the day list. The one sanctioned
 * store is the timer tick, and it is USE-3's.
 *
 * SERVER DATA IS NOT HERE. `shell.status` lives in TanStack Query, where
 * something already knows when it is stale.
 */

export type ShellContextValue = {
  /** True while any sheet owns the screen; dims the tab bar, hides `main`. */
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  /**
   * How many in-app navigations deep this session is. `useBack` reads it to
   * decide between `router.back()` and a replace: going "back" out of the app
   * into whatever the person was doing before is not a back button, it is a
   * trapdoor.
   */
  depth: number;
};

const ShellContext = React.createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const value = React.useContext(ShellContext);
  if (value === null) {
    throw new Error("useShell must be used inside <ShellProviders>");
  }
  return value;
}

/**
 * Counts open sheets rather than holding a boolean, so two sheets in one tree
 * (a confirm over a form sheet) do not un-dim the tab bar when the inner one
 * closes.
 *
 * Depth counts pathname changes since this provider mounted — which is since
 * the person entered the signed-in app. It starts at 0 on a cold open, so the
 * first screen's back button knows it has nowhere in-app to return to.
 */
export function ShellStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [openCount, setOpenCount] = React.useState(0);
  const [depth, setDepth] = React.useState(0);
  const lastPath = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastPath.current === null) {
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setDepth((current) => current + 1);
  }, [pathname]);

  const setSheetOpen = React.useCallback((open: boolean) => {
    setOpenCount((current) => Math.max(0, current + (open ? 1 : -1)));
  }, []);

  const value = React.useMemo(
    () => ({ sheetOpen: openCount > 0, setSheetOpen, depth }),
    [openCount, setSheetOpen, depth],
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}
