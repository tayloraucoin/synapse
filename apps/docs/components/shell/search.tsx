"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import type { SearchEntry } from "@/lib/search-entry";

type Result = Pick<
  SearchEntry,
  "id" | "title" | "description" | "group" | "status" | "path" | "hidden"
>;

const MAX_RESULTS = 12;

/**
 * Full-text search over every document, archived research included. The index
 * is fetched on first focus, so pages that never search never pay for it.
 */
export function Search() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState<MiniSearch<SearchEntry> | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");

  async function load() {
    if (index || failed) return;
    try {
      const entries = (await fetch("/search-index.json").then((r) =>
        r.json(),
      )) as SearchEntry[];
      const search = new MiniSearch<SearchEntry>({
        fields: ["title", "description", "headings", "text", "path"],
        storeFields: [
          "title",
          "description",
          "group",
          "status",
          "path",
          "hidden",
        ],
        searchOptions: {
          boost: { title: 4, description: 2, headings: 2 },
          prefix: true,
          fuzzy: 0.2,
        },
      });
      search.addAll(entries);
      setIndex(search);
    } catch {
      setFailed(true);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (event.key === "/" && !typing) {
        event.preventDefault();
        input.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo<Result[]>(() => {
    if (!index || query.trim().length < 2) return [];
    return index.search(query).slice(0, MAX_RESULTS) as unknown as Result[];
  }, [index, query]);

  const searching = query.trim().length >= 2;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="docs-search" className="sr-only">
        Search the docs
      </label>
      <input
        ref={input}
        id="docs-search"
        type="search"
        value={query}
        placeholder="Search everything ( / )"
        autoComplete="off"
        onFocus={load}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("");
          if (event.key === "Enter" && results[0]) {
            router.push(results[0].id);
            setQuery("");
          }
        }}
        className="h-9 w-full rounded-md border border-sidebar-border bg-background px-3 text-sm text-foreground placeholder:text-docs-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />
      {searching && (
        <div
          role="region"
          aria-live="polite"
          aria-label="Search results"
          className="flex flex-col gap-1"
        >
          {failed && (
            <p className="px-1 text-sm text-docs-muted">
              The search index did not load.
            </p>
          )}
          {!failed && !index && (
            <p className="px-1 text-sm text-docs-muted">Loading the index…</p>
          )}
          {index && results.length === 0 && (
            <p className="px-1 text-sm text-docs-muted">
              No document matches “{query.trim()}”.
            </p>
          )}
          {results.map((result) => (
            <Link
              key={result.id}
              href={result.id}
              onClick={() => setQuery("")}
              className="group/result flex flex-col gap-0.5 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="font-medium">{result.title}</span>
              <span className="text-sm text-docs-muted group-hover/result:text-sidebar-accent-foreground">
                {result.group}
                {result.hidden ? " · not in the sidebar" : ""}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
