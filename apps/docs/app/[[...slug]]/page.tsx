import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllDocs, getDocBySlug } from "@/lib/docs";
import { FrontmatterPanel } from "./_components/frontmatter-panel";
import { Markdown } from "./_components/markdown";

// Every doc is known at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug);
  return doc
    ? { title: doc.title, description: doc.description ?? undefined }
    : {};
}

export default async function DocPage({ params }: PageProps<"/[[...slug]]">) {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  return (
    <article className="prose">
      <FrontmatterPanel doc={doc} />
      {doc.hidden && (
        <p className="not-prose mb-6 rounded-md bg-muted px-3 py-2 text-sm text-docs-muted">
          Archived: read only to trace a ruling. Never loaded by agents
          (docs/index.md).
        </p>
      )}
      <Markdown body={doc.body} fromPath={doc.relativePath} />
    </article>
  );
}
