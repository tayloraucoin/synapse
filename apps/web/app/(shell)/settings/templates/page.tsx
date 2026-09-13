import { redirect } from "next/navigation";

import { settingsYourDayRoute } from "@/lib/routes";

/**
 * TP-01 is folded into Settings → Your day (UX v1.1 §4.14 — DYN-8). The
 * route stays so an old link, a bookmark, or a notification deep-link lands
 * somewhere true rather than on a 404.
 */
export default function SettingsTemplatesPage() {
  redirect(settingsYourDayRoute());
}
