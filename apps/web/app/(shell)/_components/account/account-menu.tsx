"use client";

/**
 * AccountMenu — the avatar's menu (USE-83; avatar-menu/index.md, D-USE-5,
 * D-USE-28, D-USE-88, D-USE-89).
 *
 * A DROPDOWN, NOT A SHEET: anchored under the avatar, right-aligned, no
 * scrim, so the screen beneath stays sharp. At the desk the rail footer is
 * the trigger and the menu opens upward from it.
 *
 * Who, then Set my days and Meal topics, a rule, then Profile, Install the
 * app (only in a phone browser, not installed, below the desk) and Settings.
 * No Help row. Offline it opens as online: the account is already on the
 * device, and each row's screen shows its own offline.
 *
 * The pressed avatar keeps an ink ring while open, paired with Radix's
 * `aria-expanded` (not colour alone).
 */
import * as React from "react";
import Link from "next/link";
import {
  Avatar,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  MealTopicsIcon,
  ProfileIcon,
  SetMyDaysIcon,
  SettingsIcon,
  Text,
  useIsSplit,
} from "@syn/ui";
import { PhoneArrowDownMark } from "@/components/account";
import { useDataSource } from "@/lib/data/source";
import { useAccount } from "@/lib/data/use-account";
import { isInstallOffered, useInstallState } from "@/lib/pwa/use-install-state";
import { daysRoute, settingsRoute, type SheetName } from "@/lib/routes";
import { useOpenSheet } from "../sheet-host";
import { ACCOUNT_MENU_COPY as COPY } from "./copy";

export interface AccountMenuProps {
  /** The header's avatar below the desk, or the rail's footer at it. */
  trigger: "header" | "rail";
}

const ROW =
  "min-h-(--target) gap-(--space-3) px-(--space-4) text-(length:--fs-body) text-foreground";
const GLYPH = "size-5 text-muted-foreground";

export function AccountMenu({ trigger }: AccountMenuProps) {
  const { scenario } = useDataSource();
  const account = useAccount().data;
  const install = useInstallState(scenario.install);
  const atDesk = useIsSplit();
  const openSheet = useOpenSheet();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const whoId = React.useId();
  const [open, setOpen] = React.useState(false);

  const rail = trigger === "rail";
  // The rail is the desk's: Install the app is never offered there.
  const offerInstall = !rail && isInstallOffered(install, atDesk);

  // `?state=account-*` opens the menu on load, from whichever trigger shows.
  const openOnLoad = scenario.accountMenuOpen === true;
  React.useEffect(() => {
    if (openOnLoad) setOpen(rail === atDesk);
  }, [openOnLoad, rail, atDesk]);

  const name = account?.name ?? "";
  const photo = account?.photoUrl ?? null;

  function toSheet(sheet: SheetName) {
    return () => openSheet(sheet, triggerRef.current);
  }

  const ring = cn(
    "rounded-full ring-offset-2 ring-offset-background",
    "group-data-[state=open]:ring-2 group-data-[state=open]:ring-foreground",
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {rail ? (
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              "group flex min-h-(--target) w-full min-w-0 items-center gap-(--space-3) rounded-(--radius-control) px-(--space-2) text-start",
              "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            <span className={ring}>
              <Avatar src={photo} name={name} size={28} decorative />
            </span>
            <Text as="span" variant="body" truncate>
              {name}
            </Text>
          </button>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            aria-label={COPY.trigger}
            className={cn(
              "group inline-flex size-(--target) shrink-0 items-center justify-center rounded-full",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            <span className={ring}>
              <Avatar src={photo} name={name} size={28} decorative />
            </span>
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side={rail ? "top" : "bottom"}
        sideOffset={rail ? 8 : 4}
        aria-describedby={whoId}
        // Tab closes, as Escape does, and Radix returns focus to the avatar.
        onKeyDown={(event) => {
          if (event.key === "Tab") setOpen(false);
        }}
        className={cn(
          "w-(--menu-w) rounded-(--radius-sheet) bg-background p-0 shadow-menu",
          "motion-reduce:animate-none",
        )}
      >
        <div
          id={whoId}
          className="flex items-center gap-(--space-3) px-(--space-4) py-(--space-3)"
        >
          <Avatar src={photo} name={name} size={40} decorative />
          <div className="flex min-w-0 flex-col">
            <Text as="span" variant="body" weight={600} truncate>
              {name}
            </Text>
            <Text as="span" variant="secondary" tone="muted" truncate>
              {account?.email ?? ""}
            </Text>
          </div>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />

        <div className="py-(--space-1)">
          <DropdownMenuItem asChild className={ROW}>
            <Link href={daysRoute()}>
              <SetMyDaysIcon aria-hidden="true" className={GLYPH} />
              {COPY.rows.setMyDays}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className={ROW} onSelect={toSheet("meal-topics")}>
            <MealTopicsIcon aria-hidden="true" className={GLYPH} />
            {COPY.rows.mealTopics}
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />

        <div className="py-(--space-1)">
          <DropdownMenuItem className={ROW} onSelect={toSheet("profile")}>
            <ProfileIcon aria-hidden="true" className={GLYPH} />
            {COPY.rows.profile}
          </DropdownMenuItem>
          {offerInstall ? (
            <DropdownMenuItem className={ROW} onSelect={toSheet("install")}>
              <PhoneArrowDownMark className={GLYPH} />
              {COPY.rows.install}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild className={ROW}>
            <Link href={settingsRoute()}>
              <SettingsIcon aria-hidden="true" className={GLYPH} />
              {COPY.rows.settings}
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
