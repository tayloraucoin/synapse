import type { Metadata } from "next";

import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = { title: "Privacy" };

/** SYS-3. Public, no shell. `[PENDING — Taylor: legal copy.]` */
export default function PrivacyPage() {
  return <LegalPage title="Privacy" />;
}
