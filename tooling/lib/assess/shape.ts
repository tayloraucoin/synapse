/**
 * The shape signals, S1 and S2 (assess.md's table; both inform layer 3).
 *
 * S1: workspaces in the root package.json (or a pnpm-workspace.yaml) and a
 * root turbo.json: both 0, one 1, neither 2. S1 = 2 is the gate.
 * S2: toolchain majors against tech-stack.md: none off 0, one 1, two or more 2.
 * A tool the target does not use is not off.
 */

import { listPackages, type PackageJson, type Repo } from "./repo.ts";
import type { Measure, Signal } from "./signal.ts";

/**
 * The toolchain majors of docs/engineering/tech-stack.md, read 2026-10-07:
 * Yarn 4.13.0, Node 22, TypeScript 5.9.2, Next.js 16.3.8, React 19.2.8,
 * Tailwind CSS 4.x. A target run has no toolkit docs, so they live here.
 */
export const TOOLCHAIN_MAJORS = {
  yarn: 4,
  node: 22,
  typescript: 5,
  next: 16,
  react: 19,
  tailwindcss: 4,
} as const;

type Tool = keyof typeof TOOLCHAIN_MAJORS;

const TOOL_NAMES: Record<Tool, string> = {
  yarn: "Yarn",
  node: "Node",
  typescript: "TypeScript",
  next: "Next.js",
  react: "React",
  tailwindcss: "Tailwind CSS",
};

/** The lowest major a version or range admits, or null for a tag, a protocol or `*`. */
export function readMajor(range: string): number | null {
  if (/^(workspace|catalog|link|file|git|github|npm|portal|patch):/.test(range))
    return null;
  const majors = [...range.matchAll(/(?:^|[\s|^~<>=v])(\d+)(?=[.\sx*]|$)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n));
  return majors.length ? Math.min(...majors) : null;
}

function hasWorkspaces(repo: Repo, root: PackageJson | null): string | null {
  const ws = root?.workspaces;
  const list = Array.isArray(ws) ? ws : ws?.packages;
  if (list && list.length) return `workspaces ${JSON.stringify(list)}`;
  if (repo.tracked.has("pnpm-workspace.yaml")) return "pnpm-workspace.yaml";
  return null;
}

export const S1: Signal = {
  id: "S1",
  group: "shape",
  layer: 3,
  title: "Workspaces and turbo.json",
  measure(repo): Measure {
    const root = repo.json<PackageJson>("package.json");
    const ws = hasWorkspaces(repo, root);
    const turbo = repo.tracked.has("turbo.json");
    const score = ws && turbo ? 0 : ws || turbo ? 1 : 2;
    const parts = [
      ws ? `${ws} in the root` : "no workspaces in the root package.json",
      turbo ? "turbo.json at the root" : "no turbo.json at the root",
    ];
    return {
      value: { workspaces: Boolean(ws), turbo },
      score,
      evidence: parts.join("; "),
    };
  },
};

type Found = { tool: Tool; major: number; from: string };

function findToolchain(repo: Repo): Found[] {
  const found: Found[] = [];
  // The root and the apps: a package or an example pinning an older React is not the app's toolchain.
  const packages = listPackages(repo).filter(
    (p) =>
      p.rel === "package.json" || /^apps\/[^/]+\/package\.json$/.test(p.rel),
  );
  const root = packages.find((p) => p.rel === "package.json")?.pkg;
  const manager = root?.packageManager;
  if (manager) {
    const [name, version = ""] = manager.split("@");
    // Another package manager is off the practice whatever its version.
    const major = name === "yarn" ? readMajor(version) : 0;
    if (major !== null)
      found.push({ tool: "yarn", major, from: `packageManager ${manager}` });
  } else if (repo.tracked.has("package-lock.json")) {
    found.push({ tool: "yarn", major: 0, from: "package-lock.json (npm)" });
  } else if (repo.tracked.has("pnpm-lock.yaml")) {
    found.push({ tool: "yarn", major: 0, from: "pnpm-lock.yaml (pnpm)" });
  } else if (repo.read("yarn.lock")?.startsWith("# yarn lockfile v1")) {
    found.push({ tool: "yarn", major: 1, from: "yarn.lock v1 (Yarn 1)" });
  }
  const engine = root?.engines?.node;
  if (engine) {
    const major = readMajor(engine);
    if (major !== null)
      found.push({ tool: "node", major, from: `engines.node ${engine}` });
  }
  for (const { rel, pkg } of packages) {
    const deps = { ...pkg.devDependencies, ...pkg.dependencies };
    for (const tool of [
      "typescript",
      "next",
      "react",
      "tailwindcss",
    ] as const) {
      const range = deps[tool];
      if (typeof range !== "string") continue;
      const major = readMajor(range);
      if (major !== null)
        found.push({ tool, major, from: `${tool} ${range} in ${rel}` });
    }
  }
  return found;
}

export const S2: Signal = {
  id: "S2",
  group: "shape",
  layer: 3,
  title: "Toolchain majors against tech-stack",
  measure(repo): Measure {
    const found = findToolchain(repo);
    const off = found.filter((f) => f.major !== TOOLCHAIN_MAJORS[f.tool]);
    const offTools = [...new Set(off.map((f) => f.tool))];
    const score = offTools.length === 0 ? 0 : offTools.length === 1 ? 1 : 2;
    const used = new Set(found.map((f) => f.tool));
    const unused = (Object.keys(TOOLCHAIN_MAJORS) as Tool[]).filter(
      (t) => !used.has(t),
    );
    const parts = [
      off.length
        ? `off: ${off.map((f) => `${f.from} (practice: ${TOOL_NAMES[f.tool]} ${TOOLCHAIN_MAJORS[f.tool]})`).join(", ")}`
        : "every major found matches the practice",
      ...(unused.length
        ? [`not declared: ${unused.map((t) => TOOL_NAMES[t]).join(", ")}`]
        : []),
    ];
    return {
      value: { off: offTools, unused },
      score,
      evidence: parts.join("; "),
    };
  },
};
