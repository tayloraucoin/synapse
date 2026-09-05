import { PageFrame } from "@/components/page-frame";

import { TemplateList } from "./_components/template-list";
import { TemplateListHeader } from "./_components/template-list-header";

/** TP-01 Template list. */
export default function SettingsTemplatesPage() {
  return (
    <PageFrame header={<TemplateListHeader />}>
      <TemplateList />
    </PageFrame>
  );
}
