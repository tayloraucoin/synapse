import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { resolveDocLink } from "@/lib/docs";
import { MermaidDiagram } from "./mermaid-diagram";

type MarkdownProps = {
  body: string;
  /** The rendered file's repo-relative path; relative links resolve from it. */
  fromPath: string;
};

const EXTERNAL_HREF = /^[a-z][a-z0-9+.-]*:/i;
const HTML_COMMENT = /^\s*<!--[\s\S]*?-->\s*$/;

/** A cell longer than this marks its column as prose, which gets the wider minimum. */
const PROSE_CELL = 60;
/** A column whose cells all fit this stays on one line (an ID such as WT-01). */
const KEY_CELL = 16;

type MdNode = { type: string; value?: string; children?: MdNode[] };
type HtmlNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HtmlNode[];
};

/** Drops HTML comments (build markers, notes to editors), which would otherwise print as text. */
function remarkDropComments() {
  const drop = (node: MdNode) => {
    if (!node.children) return;
    node.children = node.children.filter(
      (child) =>
        !(child.type === "html" && HTML_COMMENT.test(child.value ?? "")),
    );
    node.children.forEach(drop);
  };
  return drop;
}

function textOf(node: HtmlNode): string {
  return node.value ?? (node.children ?? []).map(textOf).join("");
}

/** The source of a fenced block tagged mermaid, or null for any other block. */
function mermaidSource(pre: HtmlNode | undefined): string | null {
  const code = pre?.children?.find((child) => child.tagName === "code");
  const className = code?.properties?.className;
  if (!code || !Array.isArray(className)) return null;
  return className.includes("language-mermaid") ? textOf(code).trimEnd() : null;
}

/**
 * Classes each table cell by its column: prose (any cell longer than
 * PROSE_CELL) keeps a readable width when its table scrolls instead of
 * collapsing to a few words per line; a key (every cell within KEY_CELL)
 * never breaks.
 */
function rehypeTableColumns() {
  const cellsOf = (row: HtmlNode) =>
    (row.children ?? []).filter(
      (cell) => cell.tagName === "td" || cell.tagName === "th",
    );
  const mark = (table: HtmlNode) => {
    const rows = (table.children ?? []).flatMap((section) =>
      (section.children ?? []).filter((row) => row.tagName === "tr"),
    );
    const longest: number[] = [];
    for (const row of rows) {
      cellsOf(row).forEach((cell, i) => {
        longest[i] = Math.max(longest[i] ?? 0, textOf(cell).length);
      });
    }
    for (const row of rows) {
      cellsOf(row).forEach((cell, i) => {
        const length = longest[i] ?? 0;
        const kind =
          length > PROSE_CELL
            ? "docs-col-prose"
            : length <= KEY_CELL
              ? "docs-col-key"
              : null;
        if (kind) cell.properties = { ...cell.properties, className: [kind] };
      });
    }
  };
  const walk = (node: HtmlNode) => {
    if (node.tagName === "table") mark(node);
    (node.children ?? []).forEach(walk);
  };
  return walk;
}

/**
 * Whether a blockquote is a field block: some paragraph opens two or more of
 * its lines with a bold label ("**Who fills:** …" then "**When:** …"). A
 * preface whose paragraphs each open with one label is not.
 */
function isFieldBlock(quote: HtmlNode): boolean {
  return (quote.children ?? []).some((p) => {
    if (p.tagName !== "p") return false;
    const labels = (p.children ?? []).filter((child, i, siblings) => {
      const before = siblings[i - 1];
      const opensLine =
        !before ||
        (before.type === "text" && /\n\s*$/.test(before.value ?? ""));
      return child.tagName === "strong" && opensLine;
    });
    return labels.length >= 2;
  });
}

function addClass(node: HtmlNode, name: string) {
  const current = node.properties?.className;
  node.properties = {
    ...node.properties,
    className: [...(Array.isArray(current) ? current : []), name],
  };
}

/** A title longer than this is set a step smaller. */
const LONG_TITLE = 90;

/**
 * Classes the idioms CSS cannot tell apart. A blockquote whose lines open
 * with labels is a field block ("Who fills / When / Lives at"); the
 * page's opening blockquote otherwise is its lead ("In one line", "How to
 * use this file"); any other blockquote stays a quote. A very long title is
 * marked so it can be set a step smaller.
 */
function rehypeDocIdioms() {
  return (root: HtmlNode) => {
    const opening = (root.children ?? []).find(
      (node) => node.type === "element" && node.tagName !== "h1",
    );
    const walk = (node: HtmlNode) => {
      if (node.tagName === "blockquote") {
        if (isFieldBlock(node)) addClass(node, "docs-fields");
        else if (node === opening) addClass(node, "docs-lead");
      }
      if (node.tagName === "h1" && textOf(node).length > LONG_TITLE) {
        addClass(node, "docs-title-long");
      }
      (node.children ?? []).forEach(walk);
    };
    walk(root);
  };
}

const DETAILS_OPEN = /^<details>\s*(?:<summary>([\s\S]*?)<\/summary>)?\s*$/;
const DETAILS_CLOSE = /^\s*<\/details>\s*$/;

/**
 * Raw HTML prints as text, except <details> and <summary>: the one raw-HTML
 * idiom the practice's files use, rebuilt here as real elements with the
 * markdown between the tags as their body. Anything else raw stays text.
 */
function rehypeDetails() {
  const rebuild = (node: HtmlNode) => {
    if (!node.children) return;
    const out: HtmlNode[] = [];
    let open: HtmlNode | null = null;
    for (const child of node.children) {
      const raw = child.type === "raw" ? (child.value ?? "") : null;
      const start = raw !== null ? DETAILS_OPEN.exec(raw.trim()) : null;
      if (start && !open) {
        open = {
          type: "element",
          tagName: "details",
          properties: { className: ["docs-details"] },
          children: start[1]
            ? [
                {
                  type: "element",
                  tagName: "summary",
                  properties: {},
                  children: [{ type: "text", value: start[1].trim() }],
                },
              ]
            : [],
        };
        out.push(open);
      } else if (open && raw !== null && DETAILS_CLOSE.test(raw)) {
        open = null;
      } else if (open) {
        open.children?.push(child);
      } else {
        out.push(child);
      }
    }
    node.children = out;
    out.forEach(rebuild);
  };
  return rebuild;
}

/**
 * Renders a repo markdown file. Links are rewritten so the browser reading
 * matches the raw reading: a link to another rendered doc becomes a route, a
 * link to any other repo file is shown but inert (its title names the path).
 * HTML comments are dropped; every table gets its own scrolling frame; a
 * fenced block tagged mermaid is drawn as a diagram; <details> blocks open
 * and close; leads, field blocks and long titles are classed for styling.
 */
export function Markdown({ body, fromPath }: MarkdownProps) {
  const components: Components = {
    a({ href = "", children }) {
      if (href.startsWith("#")) return <a href={href}>{children}</a>;
      if (EXTERNAL_HREF.test(href)) {
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      }
      const route = resolveDocLink(fromPath, href);
      if (route) return <Link href={route}>{children}</Link>;
      return (
        <span
          className="underline decoration-dotted underline-offset-4"
          title={`Repo file, not rendered here: ${href}`}
        >
          {children}
        </span>
      );
    },
    pre({ node, children }) {
      const source = mermaidSource(node as HtmlNode | undefined);
      if (source !== null) return <MermaidDiagram source={source} />;
      return <pre>{children}</pre>;
    },
    // A wide table scrolls inside its own frame, never the page.
    table({ children }) {
      return (
        <div
          className="docs-table"
          role="region"
          aria-label="Table, scrolls sideways"
          tabIndex={0}
        >
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDropComments]}
      rehypePlugins={[
        rehypeDetails,
        rehypeSlug,
        rehypeTableColumns,
        rehypeDocIdioms,
      ]}
      components={components}
    >
      {body}
    </ReactMarkdown>
  );
}
