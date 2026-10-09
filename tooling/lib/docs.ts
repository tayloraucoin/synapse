import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export type Frontmatter = Record<string, unknown>;

export type MarkdownFile = {
  /** Repo-root-relative POSIX path. */
  relativePath: string;
  /** Raw frontmatter text, or null when the file has none. */
  rawFrontmatter: string | null;
  frontmatter: Frontmatter | null;
  /** Set when the frontmatter is not valid YAML. */
  frontmatterError: string | null;
  body: string;
};

/**
 * The token estimate every budget in the toolkit uses: characters / 4 after
 * collapsing runs of whitespace (table padding costs almost nothing once
 * tokenized). A sharper counter is part of thread P-F.
 */
export const estimateTokens = (text: string) =>
  Math.ceil(text.replace(/\s+/g, " ").length / 4);

export function readText(relativePath: string): string {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

/** Splits a leading `---` block from the body. The body is returned byte for byte. */
export function splitFrontmatter(text: string): {
  raw: string | null;
  body: string;
} {
  if (!text.startsWith("---\n")) return { raw: null, body: text };
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return { raw: null, body: text };
  return { raw: text.slice(4, end), body: text.slice(end + 5) };
}

export function readMarkdown(relativePath: string): MarkdownFile {
  const { raw, body } = splitFrontmatter(readText(relativePath));
  let frontmatter: Frontmatter | null = null;
  let frontmatterError: string | null = null;
  if (raw !== null) {
    try {
      const parsed: unknown = YAML.parse(raw);
      frontmatter =
        parsed && typeof parsed === "object" ? (parsed as Frontmatter) : {};
    } catch (error) {
      frontmatterError =
        error instanceof Error ? error.message.split("\n")[0]! : String(error);
    }
  }
  return {
    relativePath,
    rawFrontmatter: raw,
    frontmatter,
    frontmatterError,
    body,
  };
}

/** Every file under a repo-relative directory, as repo-relative POSIX paths, sorted. */
export function listFiles(relativeDir: string): string[] {
  const entries = readdirSync(path.join(REPO_ROOT, relativeDir), {
    withFileTypes: true,
  });
  return entries
    .flatMap((entry) => {
      const child = path.posix.join(relativeDir, entry.name);
      if (entry.isDirectory()) return listFiles(child);
      return [child];
    })
    .sort();
}

export function listMarkdown(relativeDir: string): string[] {
  return listFiles(relativeDir).filter((file) => file.endsWith(".md"));
}
