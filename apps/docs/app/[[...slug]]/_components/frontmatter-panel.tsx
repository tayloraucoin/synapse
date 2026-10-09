import { cn } from "@syn/ui/cn";
import type { Doc } from "@/lib/docs";

/** The §2.7 fields shown inline, in this order; everything else is under "All fields". */
const PRIMARY = [
  "layer",
  "status",
  "role",
  "thread",
  "date",
  "last_reviewed",
  "load_when",
  "supersedes",
];

const STATUS_STYLE: Record<string, string> = {
  ruling: "bg-primary text-primary-foreground",
  adopted: "bg-accent text-accent-foreground",
  draft: "border border-dashed border-border text-docs-muted",
  superseded: "text-docs-muted line-through",
  archived: "bg-muted text-docs-muted",
};

function format(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(format).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Renders a document's frontmatter above its body: description, the schema fields, then the rest. */
export function FrontmatterPanel({ doc }: { doc: Doc }) {
  const fm = doc.frontmatter ?? {};
  const shown = PRIMARY.filter((key) => format(fm[key]) !== "");
  const rest = Object.keys(fm).filter(
    (key) => !PRIMARY.includes(key) && key !== "title" && key !== "description",
  );

  return (
    <header className="not-prose mb-8 flex flex-col gap-3 border-b border-border pb-6">
      <p className="font-mono text-sm wrap-anywhere text-docs-muted">
        {doc.relativePath}
      </p>
      {doc.description && (
        <p className="max-w-docs-measure text-sm text-docs-text">
          {doc.description}
        </p>
      )}
      {shown.length > 0 && (
        <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {shown.map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <dt className="text-docs-muted">{key.replace("_", " ")}</dt>
              <dd
                className={cn(
                  key === "status" && "rounded-sm px-1.5 py-0.5",
                  key === "status" && STATUS_STYLE[format(fm[key])],
                )}
              >
                {format(fm[key])}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {rest.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-docs-muted hover:text-foreground">
            All fields ({rest.length} more)
          </summary>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[max-content_1fr]">
            {rest.map((key) => (
              <div key={key} className="contents">
                <dt className="text-docs-muted">{key}</dt>
                <dd className="break-words">{format(fm[key])}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </header>
  );
}
