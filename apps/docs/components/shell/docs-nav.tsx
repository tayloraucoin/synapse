"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@syn/ui/button";
import { cn } from "@syn/ui/cn";

export type NavDoc = { kind: "doc"; href: string; title: string };
export type NavFolder = { kind: "folder"; name: string; items: NavItem[] };
export type NavItem = NavDoc | NavFolder;
export type NavGroup = { key: string; label: string; items: NavItem[] };

type DocsNavProps = {
  groups: NavGroup[];
  /** Generated files: searchable, never listed. */
  hidden: number;
};

/**
 * The client leaf of the sidebar: it needs the current path to mark the
 * active link and to open the groups and folders that contain it. Every
 * group and folder is a native <details> accordion, so it works with the
 * keyboard and without JavaScript; the reader's own toggles are kept until
 * navigation moves into a different group.
 */
export function DocsNav({ groups, hidden }: DocsNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documents" className="flex flex-col gap-1">
      {groups.map((group) =>
        group.key === "start" ? (
          <div key={group.key} className="mb-3 flex flex-col gap-1">
            {group.items.map((item) => (
              <Item key={key(item)} item={item} pathname={pathname} />
            ))}
          </div>
        ) : (
          <details
            key={group.key}
            open={contains(group.items, pathname)}
            className="group/section"
          >
            <summary className="group/summary flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-sidebar-foreground select-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <span>{group.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-normal text-docs-muted tabular-nums group-hover/summary:text-sidebar-accent-foreground">
                  {count(group.items)}
                </span>
                <Chevron className="group-open/section:rotate-90" />
              </span>
            </summary>
            <div className="mt-1 mb-2 flex flex-col gap-1">
              {group.items.map((item) => (
                <Item key={key(item)} item={item} pathname={pathname} />
              ))}
            </div>
          </details>
        ),
      )}
      {hidden > 0 && (
        <p className="mt-4 px-3 text-sm text-docs-muted">
          {hidden} generated files are searchable but not listed.
        </p>
      )}
    </nav>
  );
}

function Item({ item, pathname }: { item: NavItem; pathname: string }) {
  if (item.kind === "doc") {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-auto w-full justify-start px-3 py-2 text-left text-sm leading-normal font-normal whitespace-normal text-docs-muted",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive &&
            "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
        )}
      >
        {item.title}
      </Link>
    );
  }
  return (
    <details open={contains(item.items, pathname)} className="group/folder">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-3 py-2 font-mono text-sm text-docs-muted select-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <Chevron className="group-open/folder:rotate-90" />
        <span>{item.name}/</span>
        <span className="ml-auto font-sans tabular-nums">
          {count(item.items)}
        </span>
      </summary>
      <div className="mt-1 ml-3 flex flex-col gap-1 border-l border-sidebar-border pl-3">
        {item.items.map((child) => (
          <Item key={key(child)} item={child} pathname={pathname} />
        ))}
      </div>
    </details>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn("size-3 shrink-0 transition-transform", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function key(item: NavItem) {
  return item.kind === "doc" ? item.href : `folder:${item.name}`;
}

function count(items: NavItem[]): number {
  return items.reduce(
    (n, item) => n + (item.kind === "doc" ? 1 : count(item.items)),
    0,
  );
}

function contains(items: NavItem[], pathname: string): boolean {
  return items.some((item) =>
    item.kind === "doc"
      ? item.href === pathname
      : contains(item.items, pathname),
  );
}
