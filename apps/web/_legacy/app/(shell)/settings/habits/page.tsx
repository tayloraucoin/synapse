import { PageFrame } from "@/components/page-frame";
import { settingsRoute } from "@/lib/routes";

import { LibraryHeader } from "./_components/library-header";
import { Library } from "./_components/library";

/**
 * LB-01 Habit library.
 *
 * The screen's one `h1` is the header's title (cross-cutting §11). The header
 * is its own client leaf because its *Add* action opens the sheet, which is
 * URL state, and a Server Component cannot hold a callback.
 */
export default function SettingsHabitsPage() {
  return (
    <PageFrame header={<LibraryHeader backFallback={settingsRoute()} />}>
      <Library />
    </PageFrame>
  );
}
