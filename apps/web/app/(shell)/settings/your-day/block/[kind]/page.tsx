import { notFound } from "next/navigation";

import { BLOCK_KIND_WORDS } from "@syn/ui";
import { blockKindSchema } from "@syn/validators";

import { KindEditor } from "./_components/kind-editor";

/**
 * `/settings/your-day/block/{kind}` — the block editor for one kind (UX v1.1
 * §4.14, §3.11). The segment is validated by the same schema the API uses,
 * so a kind that 404s here cannot succeed against a procedure.
 *
 * The screen is a client leaf: which template opens is decided from the list
 * and the `?t=` query, and the editor is an autosaving canvas.
 */
export default async function SettingsYourDayBlockPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  const parsed = blockKindSchema.safeParse(kind);
  if (!parsed.success) notFound();

  return <KindEditor kind={parsed.data} />;
}

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const parsed = blockKindSchema.safeParse(kind);
  return parsed.success ? { title: BLOCK_KIND_WORDS[parsed.data] } : {};
}
