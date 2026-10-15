/**
 * Rail — the desk's navigation, from 1024 (D-USE-93, D-USE-39).
 *
 * `Sidebar` at `collapsible="none"`: any other mode brings shadcn's own
 * mobile sheet, which switches at 768 and would undo the one desk break.
 *
 * The current item is shaded `--color-surface` and set in medium weight, and
 * carries `aria-current="page"`: shape and weight as well as colour.
 *
 * THE FOOTER IS THE AVATAR MENU'S TRIGGER at the desk (USE-83, D-USE-89):
 * the avatar and the name, one button, opening the same menu upward.
 */
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Text,
} from "@syn/ui";
import { AccountMenu } from "./account";
import { SHELL_COPY as COPY } from "./copy";
import { RAIL_ITEMS, tabForPath } from "./nav-items";

export function Rail() {
  const active = tabForPath(usePathname(), useSearchParams());

  return (
    <SidebarProvider className="min-h-0">
      <Sidebar
        collapsible="none"
        aria-label={COPY.railLabel}
        className="border-border h-dvh border-e"
      >
        <SidebarHeader className="px-(--space-6) py-(--space-6)">
          <Text as="span" variant="body" weight={600}>
            {COPY.wordmark}
          </Text>
        </SidebarHeader>

        <SidebarContent className="px-(--space-3)">
          <SidebarMenu className="gap-(--space-1)">
            {RAIL_ITEMS.map((item) => {
              const current = item.tab === active;
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.tab}>
                  <SidebarMenuButton asChild isActive={current} size="lg">
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className="gap-(--space-3) px-(--space-3)"
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-border mx-(--space-3) border-t px-(--space-1) py-(--space-3)">
          <AccountMenu trigger="rail" />
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
