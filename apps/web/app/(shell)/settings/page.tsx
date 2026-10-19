import type { Metadata } from "next";
import { SETTINGS_COPY, SettingsList } from "@/components/account";

export const metadata: Metadata = { title: SETTINGS_COPY.title };

/**
 * `/settings` (USE-85): Connections and sign out, from the avatar menu.
 * Pushed: no tabs below 1024; the rail at the desk with nothing current.
 */
export default function SettingsPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <SettingsList />
    </main>
  );
}
