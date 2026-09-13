import { notFound, redirect } from "next/navigation";

import { getServerApi } from "@/lib/trpc/server";
import { settingsYourDayBlockRoute } from "@/lib/routes";

/**
 * TP-02 is the block editor under Your day (UX v1.1 §4.14 — DYN-8). The
 * template's kind is read on the server and the old link lands on the
 * editor for that kind, on that template; an archived template lands on
 * the same page, where the list shows it under archived.
 */
export default async function SettingsTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const api = await getServerApi();
  const detail = await api.template.get({ id }).catch(() => null);
  if (detail === null) notFound();

  redirect(settingsYourDayBlockRoute(detail.template.kind, id));
}
