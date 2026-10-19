import { getAllDocs, groupLabel, toHeadings, toSearchText } from "@/lib/docs";
import type { SearchEntry } from "@/lib/search-entry";

// Built once at build time, like every page (record 0007).
export const dynamic = "force-static";

/** Every rendered document, research included: hidden from the sidebar, never from search. */
export function GET() {
  const entries: SearchEntry[] = getAllDocs().map((doc) => ({
    id: doc.href,
    title: doc.title,
    description: doc.description ?? "",
    headings: toHeadings(doc.body),
    text: toSearchText(doc.body),
    group: groupLabel(doc.group),
    status: doc.status ?? "",
    path: doc.relativePath,
    hidden: doc.hidden,
  }));
  return Response.json(entries);
}
