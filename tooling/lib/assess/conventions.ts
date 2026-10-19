/**
 * The conventions signals, V1 to V5 (assess.md's table; all inform layer 3),
 * and the SDK-importer listing the reviewer map is seeded from (T6).
 *
 * V1 boundaries lint at packages/config/eslint/boundaries.js: present 0, absent 2.
 * V2 token preset at packages/config/tailwind/preset.css: present 0, absent 2.
 * V3 source files reading process.env outside an env.ts: 0, 1 to 25, over 25.
 * V4 "use client" files outside _components/, as a share: ≤10%, ≤50%, over 50%.
 * V5 money, auth, email or AI SDK importers no reviewer glob matches: 0, 1 to 10, over 10.
 */

import { readFileSync } from "node:fs";
import path, { matchesGlob } from "node:path";

import { importsModule, listImportedModules, SOURCE_FILE } from "./imports.ts";
import type { Repo } from "./repo.ts";
import { BANDS } from "./score.ts";
import type { Measure, Signal } from "./signal.ts";

const BOUNDARIES = /^packages\/config\/eslint\/boundaries\.[cm]?js$/;
const PRESET = "packages/config/tailwind/preset.css";
const ENV_READER = /(^|\/)env\.[cm]?[jt]s$/;
const CLIENT_FILE = /\.[cm]?[jt]sx?$/;

/** Vendored or installed code is not the repo's own: a committed Yarn release, a node_modules, a vendor folder. */
const VENDORED = /(?:^|\/)(?:\.yarn|node_modules|vendor)\//;

const sourceFiles = (repo: Repo) =>
  repo.files.filter((rel) => SOURCE_FILE.test(rel) && !VENDORED.test(rel));

export const V1: Signal = {
  id: "V1",
  group: "conventions",
  layer: 3,
  title: "Boundaries lint",
  measure(repo): Measure {
    const file = repo.files.find((rel) => BOUNDARIES.test(rel));
    return file
      ? { value: file, score: 0, evidence: `${file} is tracked` }
      : {
          value: null,
          score: 2,
          evidence: "no packages/config/eslint/boundaries.js",
        };
  },
};

export const V2: Signal = {
  id: "V2",
  group: "conventions",
  layer: 3,
  title: "Token preset",
  measure(repo): Measure {
    return repo.tracked.has(PRESET)
      ? { value: PRESET, score: 0, evidence: `${PRESET} is tracked` }
      : { value: null, score: 2, evidence: `no ${PRESET}` };
  },
};

/** Tracked source files outside an env.ts that read process.env. */
export function listEnvReaders(repo: Repo): string[] {
  return sourceFiles(repo).filter(
    (rel) =>
      !ENV_READER.test(rel) && /\bprocess\.env\b/.test(repo.read(rel) ?? ""),
  );
}

export const V3: Signal = {
  id: "V3",
  group: "conventions",
  layer: 3,
  title: "process.env outside env.ts",
  measure(repo): Measure {
    const readers = listEnvReaders(repo);
    const n = readers.length;
    const score = n === 0 ? 0 : n <= BANDS.envReadersPartialUpTo ? 1 : 2;
    return {
      value: n,
      score,
      evidence: n
        ? `${n} files read process.env outside an env.ts: ${readers.slice(0, 3).join(", ")}${n > 3 ? ` and ${n - 3} more` : ""}`
        : "no source file reads process.env outside an env.ts",
    };
  },
};

/** Whether a source's first statement is the "use client" directive. */
export function startsWithUseClient(source: string): boolean {
  const stripped = source
    .replace(/^﻿/, "")
    .replace(/^(?:\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/))*\s*/, "");
  return /^(?:"use client"|'use client')\s*;?/.test(stripped);
}

export function listClientFiles(repo: Repo): string[] {
  return repo.files.filter(
    (rel) =>
      CLIENT_FILE.test(rel) &&
      !VENDORED.test(rel) &&
      startsWithUseClient(repo.read(rel) ?? ""),
  );
}

export const V4: Signal = {
  id: "V4",
  group: "conventions",
  layer: 3,
  title: '"use client" outside a components folder',
  measure(repo): Measure {
    const client = listClientFiles(repo);
    const outside = client.filter((rel) => !/(^|\/)_?components\//.test(rel));
    const share = client.length ? outside.length / client.length : 0;
    const score =
      share <= BANDS.clientOutsideShareFull
        ? 0
        : share <= BANDS.clientOutsideSharePartial
          ? 1
          : 2;
    return {
      value: { client: client.length, outside: outside.length },
      score,
      evidence: client.length
        ? `${outside.length} of ${client.length} "use client" files sit outside a _components/ or components/ folder (${Math.round(share * 100)}%)`
        : 'no "use client" files',
    };
  },
};

/**
 * The SDKs the reviewer map must reach (T6): money, auth, email and AI.
 * `@stripe/*` joins `stripe`, as MIG-4's seeded rows do: a client-side
 * `@stripe/stripe-js` call is a money path too.
 */
export const SDK_MODULES: { module: string; kind: string }[] = [
  { module: "stripe", kind: "money" },
  { module: "@stripe/*", kind: "money" },
  { module: "@supabase/*", kind: "auth" },
  { module: "next-auth", kind: "auth" },
  { module: "@clerk/*", kind: "auth" },
  { module: "better-auth", kind: "auth" },
  { module: "resend", kind: "email" },
  { module: "@anthropic-ai/*", kind: "ai" },
  { module: "openai", kind: "ai" },
  { module: "ai", kind: "ai" },
  { module: "@ai-sdk/*", kind: "ai" },
];

export type SdkImportRow = { file: string; module: string; matchedBy: string };

/** The reviewer globs of the toolkit checkout's toolkit.json; an imports-only row has none. */
export function readToolkitGlobs(toolkitRoot: string): string[] {
  try {
    const text = readFileSync(path.join(toolkitRoot, "toolkit.json"), "utf8");
    const data = JSON.parse(text) as { reviewers?: { glob?: unknown }[] };
    return (data.reviewers ?? [])
      .map((row) => row.glob)
      .filter((glob): glob is string => typeof glob === "string");
  } catch {
    return [];
  }
}

/** Every tracked source file importing an SDK, with the first toolkit glob that reaches it, or "none". */
export function listSdkImports(repo: Repo, globs: string[]): SdkImportRow[] {
  const rows: SdkImportRow[] = [];
  for (const rel of sourceFiles(repo)) {
    const text = repo.read(rel);
    if (text === null || !/\b(?:import|require|from)\b/.test(text)) continue;
    const specifiers = listImportedModules(text);
    const hit = new Set<string>();
    for (const specifier of specifiers)
      for (const { module } of SDK_MODULES)
        if (importsModule(specifier, module)) hit.add(specifier);
    if (!hit.size) continue;
    const matchedBy = globs.find((glob) => matchesGlob(rel, glob)) ?? "none";
    for (const module of [...hit].sort())
      rows.push({ file: rel, module, matchedBy });
  }
  return rows;
}

/** V5 reads the listing the report prints; the toolkit globs are set once per run. */
export function makeV5(globs: string[]): Signal {
  return {
    id: "V5",
    group: "conventions",
    layer: 3,
    title: "SDK importers no reviewer glob matches",
    measure(repo): Measure {
      const rows = listSdkImports(repo, globs);
      const files = new Set(rows.map((r) => r.file));
      const unmatched = new Set(
        rows.filter((r) => r.matchedBy === "none").map((r) => r.file),
      );
      const n = unmatched.size;
      const score = n === 0 ? 0 : n <= BANDS.sdkUnmatchedPartialUpTo ? 1 : 2;
      return {
        value: { importers: files.size, unmatched: n },
        score,
        evidence: files.size
          ? `${n} of ${files.size} SDK-importing files match no reviewer glob${globs.length ? "" : " (no toolkit.json globs read)"}`
          : "no tracked file imports a money, auth, email or AI SDK",
      };
    },
  };
}
