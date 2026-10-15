"use client";

/**
 * SheetHost — the one place `?sheet=` is read and its sheet mounted, over
 * whatever screen is beneath (the account overview's routes; USE-83 makes it
 * with the `install` case and USE-84 adds `profile`; the other sheets join
 * as their tickets land).
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
import { InstallSheet, ProfileSheet } from "@/components/account";
import { ItemSheet } from "@/components/planner/item-sheet";
import { MealTopicsSheet } from "@/components/planner/meal-topics-sheet";
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

  // A scenario that opens on a sheet (`view.open: "sheet:<name>"`), once.
  const seeded = React.useRef(false);
  const seedSheet = scenario.view?.open?.startsWith("sheet:")
    ? scenario.view.open.slice("sheet:".length)
    : null;
  React.useEffect(() => {
    if (seeded.current || seedSheet === null) return;
    seeded.current = true;
    void setSheet(seedSheet);
  }, [seedSheet, setSheet]);

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
    <>
      <InstallSheet
        open={sheet === "install" && installOffered}
        onOpenChange={close}
        install={install}
        returnFocusRef={opener ?? undefined}
      />
      <ProfileSheet
        open={sheet === "profile"}
        onOpenChange={close}
        returnFocusRef={opener ?? undefined}
      />
      <MealTopicsSheet
        open={sheet === "meal-topics"}
        onOpenChange={close}
        returnFocusRef={opener ?? undefined}
      />
      <ItemSheet
        open={sheet === "item"}
        onOpenChange={close}
        returnFocusRef={opener ?? undefined}
      />
    </>
  );
}
