import { TrustLine } from "@syn/ui";
import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { DATA_COPY } from "./_components/copy";
import { DeleteSection } from "./_components/delete-section";
import { ExportSection } from "./_components/export-section";

/**
 * ST-10 Your data — the trust surface.
 *
 * THE TRUST LINE SITS ABOVE BOTH SECTIONS, in the same words and the same
 * treatment it has on the sign-in screen. The claim it makes — only the person
 * can see their data — is what the two controls below make tangible: one hands
 * the whole record over, the other destroys it. A page that promised privacy
 * somewhere else and offered these two here would be asking to be taken on
 * faith twice.
 *
 * THE ORDER IS EXPORT, THEN DELETE, and they are not adjacent (Epic 1 §0.3).
 * The destructive control is text-weight, below a hairline, at the end — far
 * enough from *Export everything* that a slip on one cannot land on the other.
 */
export default function SettingsDataPage() {
  return (
    <PageFrame header={<ShellPageHeader title={DATA_COPY.title} showBack />}>
      <div className="flex flex-col gap-(--space-4) py-(--space-4)">
        <TrustLine />
        <ExportSection />
        <DeleteSection />
      </div>
    </PageFrame>
  );
}
