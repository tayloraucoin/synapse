import { getGroups, getHiddenCount, type Doc } from "@/lib/docs";
import {
  DocsNav,
  type NavFolder,
  type NavGroup,
  type NavItem,
} from "./docs-nav";
import { Search } from "./search";

/**
 * The full-height left panel: search pinned at the top, then every visible
 * document grouped by its `layer` (or, without one, its docs/ folder), then
 * specs/, with sub-folders nested inside each group.
 * Generated files are searchable, not listed.
 */
export function Sidebar() {
  const groups: NavGroup[] = getGroups().map((group) => ({
    key: group.key,
    label: group.label,
    // Start keeps its own reading order: the map, the contract, the listing.
    items:
      group.key === "start"
        ? group.docs.map((doc) => ({
            kind: "doc" as const,
            href: doc.href,
            title: doc.navTitle,
          }))
        : toTree(group.docs),
  }));
  const hidden = getHiddenCount();

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 border-b border-sidebar-border bg-sidebar px-4 py-4">
        <Search />
      </div>
      <details className="px-4 py-4 md:hidden">
        <summary className="cursor-pointer rounded-md text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          Browse documents
        </summary>
        <div className="mt-4">
          <DocsNav groups={groups} hidden={hidden} />
        </div>
      </details>
      <div className="hidden px-4 py-4 md:block">
        <DocsNav groups={groups} hidden={hidden} />
      </div>
    </div>
  );
}

const byName = (a: string, b: string) =>
  a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });

/**
 * Orders one level the way a reader scans it: the folder's landing page, then
 * documents by the title shown, then sub-folders by name.
 */
function sortLevel(items: NavItem[], landing: Set<string>): NavItem[] {
  const rank = (item: NavItem) =>
    item.kind === "folder" ? 2 : landing.has(item.href) ? 0 : 1;
  return items
    .map((item) =>
      item.kind === "folder"
        ? { ...item, items: sortLevel(item.items, landing) }
        : item,
    )
    .sort((a, b) =>
      rank(a) !== rank(b)
        ? rank(a) - rank(b)
        : byName(
            a.kind === "folder" ? a.name : a.title,
            b.kind === "folder" ? b.name : b.title,
          ),
    );
}

/** Nests a group's documents by their folder path (`templates/refs` → templates → refs). */
function toTree(docs: Doc[]): NavItem[] {
  const landing = new Set(
    docs
      .filter(
        (doc) =>
          doc.relativePath.endsWith("/README.md") ||
          doc.relativePath === "specs/_status.md",
      )
      .map((doc) => doc.href),
  );
  const root: NavItem[] = [];
  for (const doc of docs) {
    let level = root;
    for (const name of doc.folder ? doc.folder.split("/") : []) {
      let folder = level.find(
        (item): item is NavFolder =>
          item.kind === "folder" && item.name === name,
      );
      if (!folder) {
        folder = { kind: "folder", name, items: [] };
        level.push(folder);
      }
      level = folder.items;
    }
    level.push({ kind: "doc", href: doc.href, title: doc.navTitle });
  }
  return sortLevel(root, landing);
}
