"use client";

/**
 * SheetHost — the one place `?sheet=` is read and its sheet mounted, over
 * whatever screen is beneath (the account overview's routes; USE-83 makes it
 * with the `install` case, the other sheets join as their tickets land).
 *
 * THE OPENER. A sheet opened from a menu row loses its opener when the menu
 * closes, so the row records where focus goes back to (the avatar) through
 * `useSheetOpener`, and the sheet returns focus there on close.
 *
 * NO WAY IN WHERE INSTALL IS NOT OFFERED (C-USE-install-sheet-5): installed,
 * at the desk, or off a phone, a direct `?sheet=install` closes to the screen
 * beneath once the device has been read (install-sheet/states/installed.md).
 */
import * as React from "react";
import { useQueryState } from "nuqs";
import { useIsSplit } from "@syn/ui";
import { InstallSheet } from "@/components/account";
import { useDataSource } from "@/lib/data/source";
import { isInstallOffered, useInstallState } from "@/lib/pwa/use-install-state";
import type { SheetName } from "@/lib/routes";

type OpenerRef = React.RefObject<HTMLElement | null>;

const SheetOpenerContext = React.createContext<OpenerRef | null>(null);

export function SheetOpenerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const opener = React.useRef<HTMLElement | null>(null);
  return (
    <SheetOpenerContext.Provider value={opener}>
      {children}
    </SheetOpenerContext.Provider>
  );
}

/** Open a sheet by name, remembering where focus returns when it closes. */
export function useOpenSheet(): (
  sheet: SheetName,
  opener: HTMLElement | null,
) => void {
  const opener = React.useContext(SheetOpenerContext);
  const [, setSheet] = useQueryState("sheet");
  return React.useCallback(
    (sheet, element) => {
      if (opener !== null) opener.current = element;
      void setSheet(sheet);
    },
    [opener, setSheet],
  );
}

export function SheetHost() {
  const [sheet, setSheet] = useQueryState("sheet");
  const opener = React.useContext(SheetOpenerContext);
  const { scenario } = useDataSource();
  const install = useInstallState(scenario.install);
  const atDesk = useIsSplit();
  const installOffered = isInstallOffered(install, atDesk);

  React.useEffect(() => {
    if (sheet === "install" && install.known && !installOffered) {
      void setSheet(null);
    }
  }, [sheet, install.known, installOffered, setSheet]);

  const close = React.useCallback(
    (open: boolean) => {
      if (!open) void setSheet(null);
    },
    [setSheet],
  );

  return (
    <InstallSheet
      open={sheet === "install" && installOffered}
      onOpenChange={close}
      install={install}
      returnFocusRef={opener ?? undefined}
    />
  );
}
