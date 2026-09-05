"use client";

import { useRouter } from "next/navigation";

import { ShellPageHeader } from "@/components/page-frame";
import { TEMPLATE_COPY as COPY } from "@/components/template-editor";
import { trpc } from "@/lib/trpc/client";
import { settingsRoute, settingsTemplateRoute } from "@/lib/routes";

/**
 * TP-01's header. *New* creates the row and opens the editor: a slot needs a
 * template id to hang off, so the draft is real from the first keystroke and
 * `discardIfEmpty` cleans it up if nothing came of it.
 */
export function TemplateListHeader() {
  const router = useRouter();
  const create = trpc.template.create.useMutation();

  return (
    <ShellPageHeader
      title={COPY.listTitle}
      showBack
      backFallback={settingsRoute()}
      action={{
        label: COPY.new,
        busy: create.isPending,
        onClick: () => {
          void create.mutateAsync().then((created) => {
            router.push(settingsTemplateRoute(created.id));
          });
        },
      }}
    />
  );
}
