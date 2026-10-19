"use client";

import { useEffect, useId, useRef, useState } from "react";

type MermaidDiagramProps = {
  /** The fenced block's text, as written in the markdown. */
  source: string;
};

type Drawn =
  | { kind: "source" }
  | { kind: "svg"; svg: string }
  | { kind: "error"; message: string };

/**
 * Diagram roles, each read from a docs token. Lines and borders take the
 * muted text colour, not --border: a hairline token is too faint for a line
 * that carries meaning (WCAG 1.4.11 asks 3:1).
 */
const ROLES = {
  page: "--background",
  node: "--muted",
  text: "--foreground",
  label: "--docs-text",
  line: "--docs-muted",
} as const;

type Palette = Record<keyof typeof ROLES, string>;

/**
 * Mermaid's colour parser reads neither var() nor oklch(), so each token is
 * resolved in the live theme and painted to one canvas pixel to read it back
 * as sRGB hex.
 */
function readPalette(host: HTMLElement): Palette {
  const probe = document.createElement("span");
  host.append(probe);
  const ctx = document.createElement("canvas").getContext("2d", {
    willReadFrequently: true,
  });
  const read = (token: string) => {
    probe.style.color = `var(${token})`;
    if (!ctx) return getComputedStyle(probe).color;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  };
  const palette = Object.fromEntries(
    Object.entries(ROLES).map(([role, token]) => [role, read(token)]),
  ) as Palette;
  probe.remove();
  return palette;
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

/** The first line of a parse error ("Parse error on line 3:"), plus what was expected. */
function shortError(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  const lines = text.split("\n").filter((line) => line.trim());
  const expecting = lines.find((line) => line.startsWith("Expecting"));
  return [lines[0], expecting].filter(Boolean).join(" ");
}

/**
 * Draws one Mermaid block. The library is imported only when a diagram
 * mounts, so a page with no diagram loads none of it. Until it draws, and if
 * it cannot, the reader sees the source; a broken diagram adds a short error.
 * It redraws when the theme class on <html> changes.
 */
export function MermaidDiagram({ source }: MermaidDiagramProps) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const frame = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState<Drawn>({ kind: "source" });
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(isDark());
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = frame.current;
    if (dark === null || !host) return;
    let cancelled = false;

    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        const palette = readPalette(host);
        const type = getComputedStyle(host);
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          darkMode: dark,
          fontFamily: type.fontFamily,
          themeVariables: {
            darkMode: dark,
            fontFamily: type.fontFamily,
            fontSize: type.fontSize,
            background: palette.page,
            primaryColor: palette.node,
            primaryTextColor: palette.text,
            primaryBorderColor: palette.line,
            secondaryColor: palette.node,
            tertiaryColor: palette.page,
            mainBkg: palette.node,
            nodeBorder: palette.line,
            nodeTextColor: palette.text,
            textColor: palette.text,
            titleColor: palette.text,
            lineColor: palette.line,
            clusterBkg: palette.page,
            clusterBorder: palette.line,
            edgeLabelBackground: palette.page,
          },
          // Corners follow the radius token; the edge label reads as body text.
          // The neo look's drop shadow is a fixed grey, not a token: off, and
          // it outranks this sheet, hence !important.
          themeCSS: `
            .node rect, .cluster rect { rx: var(--radius-sm); ry: var(--radius-sm); }
            .node *, .cluster *, .icon-shape * { filter: none !important; }
            .edgeLabel, .edgeLabel p { color: ${palette.label}; }
          `,
        });
        await mermaid.parse(source);
        const { svg } = await mermaid.render(id, source);
        if (!cancelled) setDrawn({ kind: "svg", svg });
      } catch (error) {
        document.getElementById(`d${id}`)?.remove();
        if (!cancelled) setDrawn({ kind: "error", message: shortError(error) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dark, id, source]);

  // Drawn at its natural width: a diagram wider than the column scrolls in
  // its frame rather than shrinking its text.
  useEffect(() => {
    const svg = frame.current?.querySelector("svg");
    const width = svg?.viewBox.baseVal.width;
    if (!svg || !width) return;
    svg.setAttribute("width", String(width));
    svg.style.maxWidth = "none";
  }, [drawn]);

  if (drawn.kind === "svg") {
    return (
      <div
        ref={frame}
        className="docs-diagram"
        role="region"
        aria-label="Diagram, scrolls sideways"
        tabIndex={0}
        dangerouslySetInnerHTML={{ __html: drawn.svg }}
      />
    );
  }

  return (
    <div ref={frame} className="docs-diagram-source">
      {drawn.kind === "error" && (
        <p className="docs-diagram-error" role="note">
          This diagram could not be drawn: {drawn.message}
        </p>
      )}
      <pre>
        <code className="language-mermaid">{source}</code>
      </pre>
    </div>
  );
}
