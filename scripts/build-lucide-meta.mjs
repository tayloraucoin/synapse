/**
 * Write `lucide-meta.json` for the icon picker (USE-11): every Lucide icon's
 * name, its group and its keywords, at the exact version the lockfile pins.
 *
 * WHY A COMMITTED FILE. `lucide-react` ships the drawings but not Lucide's
 * categories or tags, and the picker needs both on the device: the groups and
 * the pinned group bar, and Suggested and search matched with no request.
 * Lucide keeps them as `icons/<name>.json` and `categories/<id>.json` in its
 * repository, so this reads them once from the release tag and writes a
 * compact JSON the picker loads lazily, from our own bundle.
 *
 * Rerun when the `lucide-react` pin moves (Lucide renames icons between
 * versions; the picker stores names, so a moved pin is also when old names
 * are mapped). Taylor's call at the USE Tickets gate.
 *
 * Usage: node scripts/build-lucide-meta.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const output = resolve(
  repoRoot,
  "packages/ui/src/composed/control/icon-picker/lucide-meta.json",
);

const { version } = JSON.parse(
  await readFile(
    resolve(repoRoot, "node_modules/lucide-react/package.json"),
    "utf8",
  ),
);

/**
 * The groups a day planner reaches for first, in the bar's order; the rest
 * follow alphabetically by title. Titles are Lucide's, except where the
 * boards name the group in the app's own words.
 */
const LEAD = [
  "medical",
  "home",
  "food-beverage",
  "transportation",
  "devices",
  "nature",
  "shapes",
];
const TITLES = { medical: "Health and body" };

const work = await mkdtemp(join(tmpdir(), "lucide-meta-"));
try {
  const archive = join(work, "lucide.tgz");
  const url = `https://codeload.github.com/lucide-icons/lucide/tar.gz/refs/tags/${version}`;
  // curl rather than fetch: it honours the machine's proxy settings.
  execFileSync("curl", ["-fsSL", url, "-o", archive], { stdio: "inherit" });
  execFileSync("tar", [
    "-xzf",
    archive,
    "-C",
    work,
    "--include=*/icons/*.json",
    "--include=*/categories/*.json",
  ]);
  const root = join(work, `lucide-${version}`);

  const categoryFiles = await readdir(join(root, "categories"));
  const titles = new Map();
  for (const file of categoryFiles.filter((f) => f.endsWith(".json"))) {
    const id = file.replace(/\.json$/, "");
    const { title, icon } = JSON.parse(
      await readFile(join(root, "categories", file), "utf8"),
    );
    titles.set(id, { id, title: TITLES[id] ?? title, icon });
  }
  const rank = (id) => {
    const lead = LEAD.indexOf(id);
    return lead === -1 ? LEAD.length : lead;
  };
  const categories = [...titles.values()].sort(
    (a, b) => rank(a.id) - rank(b.id) || a.title.localeCompare(b.title),
  );

  const iconFiles = (await readdir(join(root, "icons")))
    .filter((f) => f.endsWith(".json"))
    .sort();
  const icons = [];
  for (const file of iconFiles) {
    const name = file.replace(/\.json$/, "");
    const meta = JSON.parse(await readFile(join(root, "icons", file), "utf8"));
    const known = (meta.categories ?? []).filter((c) => titles.has(c));
    // One group per icon, the one that ranks first, so no icon shows twice.
    const [group] = known.sort((a, b) => rank(a) - rank(b));
    if (!group) continue;
    icons.push({ n: name, g: group, t: meta.tags ?? [] });
  }

  await writeFile(
    output,
    `${JSON.stringify({ version, categories, icons })}\n`,
  );
  console.log(
    `[lucide-meta] ${icons.length} icons in ${categories.length} groups at ${version} → ${output.replace(`${repoRoot}/`, "")}`,
  );
} finally {
  await rm(work, { recursive: true, force: true });
}
