import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import YAML from "yaml";

/**
 * The docs app renders markdown that lives OUTSIDE it: the root `AGENTS.md`,
 * everything under the root `docs/`, and everything under the root `specs/`.
 * Those files are the source of truth (agents and GitHub read them raw); this
 * app is only a reader (PEM records 0004, 0007; docs/pem/README.md).
 *
 * `next dev` and `next build` run with the app directory as the working
 * directory (turbo runs each task in its package), so the repo root is two
 * levels up.
 */
const REPO_ROOT = path.resolve(process.cwd(), "../..");

/**
 * Every page is prerendered (`dynamicParams = false`), so these reads happen
 * only at build time. The ignore comment stops Turbopack from tracing the
 * whole repository into the server output on their account.
 */
function fromRepoRoot(relativePath: string) {
  return path.join(/* turbopackIgnore: true */ REPO_ROOT, relativePath);
}

/** Directories rendered, and the route prefix each one mounts at. */
const CONTENT_ROOTS = [
  { dir: "docs", prefix: [] as string[] },
  { dir: "specs", prefix: ["specs"] },
];
const SPINE_PATH = "AGENTS.md";
const INDEX_PATH = "docs/index.md";
const START_PATH = "docs/README.md";
const MAP_PATH = "docs/architecture/directory-map.md";
/** The specs/ landing page, at `/specs`: the status board (specs/ has no README). */
const SPECS_LANDING = "specs/_status.md";
/** The Start group, in this order; each is labelled with its file name. */
const START_PATHS = [START_PATH, INDEX_PATH, SPINE_PATH, MAP_PATH];
/** A folder's landing page: README.md, or docs/index.md at the root (record 0006). */
const LANDING = "README.md";

/**
 * Sidebar groups. A doc with a known `layer` value joins that layer's group;
 * a doc without one (most of Synapse's own docs, e.g. docs/ux/) joins the
 * group named for its top folder under docs/, so frontmatter is never
 * required. Everything under specs/ is one group, listed last.
 */
const LAYERS = new Set([
  "decisions",
  "design",
  "product",
  "measurement",
  "runbooks",
  "roles",
  "prompts",
  "references",
  "engineering",
  "workflows",
  "research",
]);
const SPECS_GROUP = "specs";

/** Labels that a folder name would spell wrong; any other key is capitalised. */
const LABELS: Record<string, string> = {
  start: "Start",
  specs: "Specs",
  ux: "UX",
  pem: "PEM",
  "ai-guides": "AI guides",
  "developer-guides": "Developer guides",
};

/** Never listed in the sidebar; still rendered and searchable. Synapse has none yet. */
const HIDDEN_GROUPS = new Set<string>();

export type Frontmatter = Record<string, unknown>;

export type Doc = {
  /** Route segments; `[]` is the map (`docs/index.md`). */
  slug: string[];
  href: string;
  title: string;
  /** The sidebar label: the title, plus the file name for Start entries. */
  navTitle: string;
  description: string | null;
  /** Repo-root-relative POSIX path, e.g. `docs/design/canon.md`. */
  relativePath: string;
  /** Sidebar group key (a `layer` value, a docs/ folder, or start / specs). */
  group: string;
  /** Subfolder below the group's folder, for sub-headings (e.g. `templates`). */
  folder: string;
  status: string | null;
  hidden: boolean;
  frontmatter: Frontmatter | null;
  body: string;
};

export type Group = { key: string; label: string; docs: Doc[] };

/** Read once per render; `next dev` re-reads on every request. */
export const getAllDocs = cache((): Doc[] => {
  const files = [
    INDEX_PATH,
    SPINE_PATH,
    ...CONTENT_ROOTS.flatMap(({ dir }) => listMarkdownFiles(dir)).filter(
      (f) => f !== INDEX_PATH,
    ),
  ];
  return files.map(readDoc).sort(compareDocs);
});

export function getDocBySlug(slug: string[]): Doc | undefined {
  const href = toHref(slug);
  return getAllDocs().find((doc) => doc.href === href);
}

/** Visible sidebar groups with their documents: Start first, Specs last, the rest by label. */
export function getGroups(): Group[] {
  const docs = getAllDocs();
  const keys = [...new Set(docs.map((doc) => doc.group))];
  return keys
    .filter((key) => !HIDDEN_GROUPS.has(key))
    .map((key) => ({
      key,
      label: groupLabel(key),
      docs: docs.filter((d) => d.group === key),
    }))
    .sort((a, b) => compareGroups(a.key, b.key));
}

export function getHiddenCount() {
  return getAllDocs().filter((doc) => doc.hidden).length;
}

export function groupLabel(key: string) {
  return LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function groupRank(key: string) {
  return key === "start" ? 0 : key === SPECS_GROUP ? 2 : 1;
}

function compareGroups(a: string, b: string) {
  return (
    groupRank(a) - groupRank(b) ||
    groupLabel(a).localeCompare(groupLabel(b), "en", { sensitivity: "base" })
  );
}

/**
 * Maps a markdown link written inside `fromPath` to a route in this app.
 * Returns `null` when the target is a repo file the app does not render.
 */
export function resolveDocLink(
  fromPath: string,
  target: string,
): string | null {
  const [targetPath = "", hash] = target.split("#");
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(fromPath), targetPath),
  );
  const doc = getAllDocs().find(
    (candidate) => candidate.relativePath === resolved,
  );
  if (!doc) return null;
  return hash ? `${doc.href}#${hash}` : doc.href;
}

function listMarkdownFiles(relativeDir: string): string[] {
  const absolute = fromRepoRoot(relativeDir);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.posix.join(relativeDir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(relativePath);
    return entry.name.endsWith(".md") ? [relativePath] : [];
  });
}

function splitFrontmatter(text: string): {
  frontmatter: Frontmatter | null;
  body: string;
} {
  if (!text.startsWith("---\n")) return { frontmatter: null, body: text };
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return { frontmatter: null, body: text };
  try {
    const parsed: unknown = YAML.parse(text.slice(4, end));
    return {
      frontmatter:
        parsed && typeof parsed === "object" ? (parsed as Frontmatter) : {},
      body: text.slice(end + 5),
    };
  } catch {
    return { frontmatter: null, body: text };
  }
}

function readDoc(relativePath: string): Doc {
  const { frontmatter, body } = splitFrontmatter(
    fs.readFileSync(fromRepoRoot(relativePath), "utf8"),
  );
  const slug = toSlug(relativePath);
  const group = toGroup(relativePath, frontmatter);
  const str = (key: string) => {
    const value = frontmatter?.[key];
    return typeof value === "string" && value.length > 0 ? value : null;
  };
  // Titles are plain text in the sidebar, the tab and search; drop inline-code backticks.
  const title = (
    str("title") ??
    body.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
    path.posix.basename(relativePath, ".md")
  ).replace(/`/g, "");
  return {
    slug,
    href: toHref(slug),
    title,
    navTitle:
      group === "start"
        ? `${title} (${path.posix.basename(relativePath)})`
        : title,
    description: str("description"),
    relativePath,
    group,
    folder: toFolder(relativePath, group),
    status: str("status"),
    hidden: HIDDEN_GROUPS.has(group),
    frontmatter,
    body,
  };
}

function toSlug(relativePath: string): string[] {
  if (relativePath === SPINE_PATH) return ["agents"];
  if (relativePath === INDEX_PATH) return [];
  if (relativePath === SPECS_LANDING) return [SPECS_GROUP];
  const root = CONTENT_ROOTS.find(({ dir }) =>
    relativePath.startsWith(`${dir}/`),
  )!;
  const segments = relativePath
    .slice(root.dir.length + 1, -".md".length)
    .replace(/\.template$/, "-template")
    .toLowerCase()
    .split("/");
  // A folder's README.md is its route; the docs root keeps index.md as the map.
  const last = segments.at(-1);
  const slug =
    last === "readme" && relativePath !== START_PATH
      ? segments.slice(0, -1)
      : segments;
  return [...root.prefix, ...slug];
}

function toHref(slug: string[]) {
  return `/${slug.join("/")}`;
}

function toGroup(
  relativePath: string,
  frontmatter: Frontmatter | null,
): string {
  if (START_PATHS.includes(relativePath)) return "start";
  if (relativePath.startsWith(`${SPECS_GROUP}/`)) return SPECS_GROUP;
  const layer = frontmatter?.layer;
  if (typeof layer === "string" && LAYERS.has(layer)) return layer;
  // docs/<folder>/… groups by <folder>; a loose file at the docs root by "docs".
  const segments = relativePath.split("/");
  return segments.length > 2 ? segments[1]! : "docs";
}

/** The folder path between the group's own folder and the file, e.g. `templates/refs`. */
function toFolder(relativePath: string, group: string): string {
  if (group === "start") return "";
  const segments = relativePath.split("/").slice(0, -1);
  const rootDepth = group === SPECS_GROUP ? 1 : 2;
  return segments.slice(rootDepth).join("/");
}

/** Group order, then folder, then a folder's index first, then path. */
function compareDocs(a: Doc, b: Doc) {
  if (a.group !== b.group) return compareGroups(a.group, b.group);
  if (a.group === "start") {
    return (
      START_PATHS.indexOf(a.relativePath) - START_PATHS.indexOf(b.relativePath)
    );
  }
  if (a.folder !== b.folder) {
    if (a.folder === "") return -1;
    if (b.folder === "") return 1;
    return a.folder.localeCompare(b.folder);
  }
  const isLanding = (doc: Doc) =>
    path.posix.basename(doc.relativePath) === LANDING ||
    doc.relativePath === SPECS_LANDING;
  if (isLanding(a) !== isLanding(b)) return isLanding(a) ? -1 : 1;
  return a.relativePath.localeCompare(b.relativePath);
}

/** Plain text for the search index: markdown syntax stripped, words kept. */
export function toSearchText(body: string) {
  return body
    .replace(/```\w*/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|]/g, " ")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toHeadings(body: string) {
  return [...body.matchAll(/^#{1,4}\s+(.+)$/gm)]
    .map((m) => m[1]!.trim())
    .join(" · ");
}
