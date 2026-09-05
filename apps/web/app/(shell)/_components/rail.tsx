/**
 * Rail — wide navigation (v2 handoff §5.2).
 *
 * CC's `sidebar` primitive at `collapsible="none"`: there is nothing to
 * collapse in a four-item rail, and a collapse control would be a piece of
 * chrome whose only job is to hide the navigation.
 *
 * Same `NAV_ITEMS` and the same active rule as `TabBar` — one list, two
 * shapes.
 *
 * The wordmark is text, not a logo (official spec §9.8).
 */
"use client";

import {
  Avatar,
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { settingsRoute } from "@/lib/routes";
import { NAV_ITEMS, REVIEW_DOT_LABEL, type NavTab } from "./nav-items";

function tabForPath(pathname: string): NavTab {
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/review")) return "review";
  if (pathname.endsWith("/schedule")) return "schedule";
  return "list";
}

export interface RailProps {
  reviewHasPending: boolean;
  user: { name: string; imageUrl: string | null };
}

export function Rail({ reviewHasPending, user }: RailProps) {
  const pathname = usePathname();
  const active = tabForPath(pathname);

  return (
    <SidebarProvider>
      <Sidebar collapsible="none" aria-label="Main">
        <SidebarHeader className="px-(--space-5) py-(--space-5)">
          <Text as="span" variant="body" weight={500}>
            Synapse
          </Text>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.tab}>
                <SidebarMenuButton asChild isActive={item.tab === active}>
                  <Link href={item.href} aria-current={item.tab === active ? "page" : undefined}>
                    <span>{item.label}</span>
                    {item.tab === "review" && reviewHasPending ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="bg-accent-mark ms-auto size-1.5 rounded-full"
                        />
                        <span className="sr-only">{REVIEW_DOT_LABEL}</span>
                      </>
                    ) : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="px-(--space-5) py-(--space-4)">
          <Link
            href={settingsRoute()}
            aria-label="Settings"
            className="flex items-center gap-(--space-2)"
          >
            <Avatar src={user.imageUrl} name={user.name} label="Settings" />
            <Text as="span" variant="secondary" truncate>
              {user.name}
            </Text>
          </Link>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
