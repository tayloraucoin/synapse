import { TemplateEditorScreen } from "@/components/template-editor/template-editor-screen";

/**
 * TP-02 Template editor — a canvas.
 *
 * It autosaves per change and never prompts to discard (Epic 1 §0.3): there is
 * nothing unsaved to discard. The slot sheet inside it is a form and does have
 * a discard prompt, which is the distinction the document draws between the
 * two shapes.
 */
export default async function SettingsTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TemplateEditorScreen templateId={id} />;
}
