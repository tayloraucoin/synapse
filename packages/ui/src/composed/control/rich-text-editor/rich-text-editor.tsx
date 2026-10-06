/**
 * RichTextEditor — a passage's editor that speaks Markdown (UX v1.2 §4.6,
 * §10.2, §10.4; TD-15, TD-16; RUN-7).
 *
 * FIVE CONTROLS AND NOTHING ELSE: bold · italic · quote · list · link, in a
 * `role="toolbar"` pinned to the bottom of the editor's viewport on mobile —
 * above the keyboard. Headings, images, colour and tables are not installed
 * as extensions, so a heading pasted or typed as Markdown becomes a plain
 * paragraph and round-trips as its text without the `#`. That is the
 * product's ruling on what a passage is, enforced by the schema rather than
 * by a rule someone has to remember.
 *
 * MARKDOWN AT THE BOUNDARY. `valueMd` in, `onChangeMd` out — `tiptap-markdown`
 * parses on the way in and serialises on the way out, so the row stores what
 * a person could read in any editor, and `@syn/api` never sees HTML. tiptap
 * is `@syn/ui`'s alone (`RESTRICTED_EXTERNAL`).
 *
 * ONE RENDERER. `readOnly` renders the same document under the same
 * `prose-passage` styles with no toolbar, so the orient frame's passage and
 * the sheet's editor cannot drift — and no HTML string is ever set on a
 * node; the document is the only source of the markup.
 *
 * `offline` shows the standard line and keeps the editor editable: the words
 * are the person's and stay on screen; the save is the caller's to retry.
 */
"use client";

import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import { BulletList, ListItem } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { Placeholder, UndoRedo } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { Bold as BoldGlyph, Italic as ItalicGlyph, Link2, List, Quote } from "lucide-react";
import * as React from "react";
import { Markdown } from "tiptap-markdown";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Input } from "../../../primitives/control/input";
import { HelperText } from "../../../primitives/display/helper-text";
import { Popover, PopoverAnchor, PopoverContent } from "../../../primitives/feedback/popover";
import { Text as Type } from "../../../primitives/typography/text";
import { RICH_TEXT_EDITOR_COPY } from "./copy";

export interface RichTextEditorProps {
  valueMd: string;
  onChangeMd?: (markdown: string) => void;
  label?: React.ReactNode;
  placeholder?: string;
  /** The editor's least height, in lines of body text. */
  minRows?: number;
  /** The same prose, no toolbar, not editable. */
  readOnly?: boolean;
  /** The standard line; the editor stays editable. */
  offline?: boolean;
  error?: React.ReactNode;
  className?: string;
}

/** The schema: five things a passage can be, and the plumbing. */
function extensionsFor(placeholder: string | undefined) {
  return [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Blockquote,
    BulletList,
    ListItem,
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener noreferrer" },
    }),
    UndoRedo,
    Placeholder.configure({ placeholder: placeholder ?? "" }),
    // `html: false` — an HTML tag in the Markdown is text, never markup.
    Markdown.configure({ html: false, transformPastedText: true, transformCopiedText: true }),
  ];
}

function markdownOf(editor: Editor): string {
  const storage = editor.storage as { markdown?: { getMarkdown: () => string } };
  return storage.markdown?.getMarkdown() ?? "";
}

type Marks = { bold: boolean; italic: boolean; quote: boolean; list: boolean; link: boolean };
const NO_MARKS: Marks = { bold: false, italic: false, quote: false, list: false, link: false };

export function RichTextEditor({
  valueMd,
  onChangeMd,
  label,
  placeholder,
  minRows = 6,
  readOnly = false,
  offline = false,
  error,
  className,
}: RichTextEditorProps) {
  const labelId = React.useId();
  const helperId = React.useId();
  const lastEmitted = React.useRef(valueMd);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkDraft, setLinkDraft] = React.useState("");

  const editor = useEditor(
    {
      extensions: extensionsFor(placeholder),
      content: valueMd,
      editable: !readOnly,
      // Rendered on the client only, so the server and the first paint agree.
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: cn("prose-passage outline-none", !readOnly && "min-h-[var(--editor-min-h)]"),
          "aria-labelledby": label === undefined ? "" : labelId,
          "aria-multiline": "true",
          role: "textbox",
        },
      },
      onUpdate: ({ editor: current }) => {
        const next = markdownOf(current);
        lastEmitted.current = next;
        onChangeMd?.(next);
      },
    },
    [readOnly, placeholder],
  );

  // A new value from outside (a refetch, a reset) replaces the document; the
  // editor's own emissions do not, so the caret stays where it is.
  React.useEffect(() => {
    if (!editor || valueMd === lastEmitted.current) return;
    lastEmitted.current = valueMd;
    editor.commands.setContent(valueMd, { emitUpdate: false });
  }, [editor, valueMd]);

  const marks: Marks =
    useEditorState({
      editor,
      selector: ({ editor: current }): Marks =>
        current === null
          ? NO_MARKS
          : {
              bold: current.isActive("bold"),
              italic: current.isActive("italic"),
              quote: current.isActive("blockquote"),
              list: current.isActive("bulletList"),
              link: current.isActive("link"),
            },
    }) ?? NO_MARKS;

  const openLink = () => {
    if (!editor) return;
    const current = editor.getAttributes("link") as { href?: string };
    setLinkDraft(current.href ?? "");
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const href = linkDraft.trim();
    if (href === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  const invalid = error !== undefined && error !== null;
  const message = error ?? (offline ? RICH_TEXT_EDITOR_COPY.offline : undefined);

  const controls: Array<{
    key: keyof Marks;
    label: string;
    Icon: typeof BoldGlyph;
    run: () => void;
    shortcut?: string;
  }> = [
    { key: "bold", label: RICH_TEXT_EDITOR_COPY.bold, Icon: BoldGlyph, shortcut: "⌘B", run: () => editor?.chain().focus().toggleBold().run() },
    { key: "italic", label: RICH_TEXT_EDITOR_COPY.italic, Icon: ItalicGlyph, shortcut: "⌘I", run: () => editor?.chain().focus().toggleItalic().run() },
    { key: "quote", label: RICH_TEXT_EDITOR_COPY.quote, Icon: Quote, run: () => editor?.chain().focus().toggleBlockquote().run() },
    { key: "list", label: RICH_TEXT_EDITOR_COPY.list, Icon: List, run: () => editor?.chain().focus().toggleBulletList().run() },
    { key: "link", label: RICH_TEXT_EDITOR_COPY.link, Icon: Link2, shortcut: "⌘K", run: openLink },
  ];

  if (readOnly) {
    return (
      <div className={cn("flex flex-col gap-(--space-2)", className)} data-rich-text-editor="read-only">
        {label === undefined ? null : (
          <Type as="span" id={labelId} variant="secondary" weight={500} className="sr-only">
            {label}
          </Type>
        )}
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-(--space-2)", className)}
      data-rich-text-editor
      style={{ ["--editor-min-h" as string]: `calc(${minRows} * var(--fs-body) * var(--lh-body))` }}
      onKeyDown={(event) => {
        // ⌘/Ctrl+K: the link field, as the toolbar button does (§10.4).
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          openLink();
        }
      }}
    >
      {label === undefined ? null : (
        <Type as="span" id={labelId} variant="secondary" weight={500}>
          {label}
        </Type>
      )}

      <div
        className={cn(
          "bg-paper flex flex-col rounded-(--radius) border",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          invalid ? "border-ink" : "border-input",
        )}
      >
        <div className="px-(--space-3) py-(--space-3)">
          <EditorContent editor={editor} aria-describedby={message === undefined ? undefined : helperId} />
        </div>

        {/* Pinned above the keyboard on mobile; wraps to two rows at 200% text. */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverAnchor asChild>
            <div
              role="toolbar"
              aria-label={RICH_TEXT_EDITOR_COPY.toolbar}
              aria-orientation="horizontal"
              className="bg-paper border-hairline sticky bottom-0 flex flex-wrap items-center gap-(--space-1) rounded-b-(--radius) border-t px-(--space-1) py-(--space-1)"
            >
              {controls.map(({ key, label: text, Icon, run, shortcut }) => (
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={text}
                  aria-pressed={marks[key]}
                  aria-keyshortcuts={shortcut}
                  title={shortcut === undefined ? text : `${text} · ${shortcut}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={run}
                  className={cn(marks[key] && "bg-surface text-ink")}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </Button>
              ))}
            </div>
          </PopoverAnchor>

          <PopoverContent align="start" side="top" className="w-[min(20rem,calc(100vw-32px))] p-(--space-3)">
            <form
              className="flex flex-col gap-(--space-2)"
              onSubmit={(event) => {
                event.preventDefault();
                applyLink();
              }}
            >
              <Input
                mode="text"
                label={RICH_TEXT_EDITOR_COPY.linkField}
                placeholder={RICH_TEXT_EDITOR_COPY.linkPlaceholder}
                value={linkDraft}
                inputMode="url"
                autoFocus
                onChange={(event) => setLinkDraft(event.target.value)}
              />
              <div className="flex items-center justify-end gap-(--space-2)">
                {marks.link ? (
                  <Button type="button" variant="ghost" size="sm" onClick={removeLink}>
                    {RICH_TEXT_EDITOR_COPY.linkRemove}
                  </Button>
                ) : null}
                <Button type="submit" size="sm">
                  {RICH_TEXT_EDITOR_COPY.linkApply}
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      {message === undefined ? null : (
        <HelperText id={helperId} error={invalid}>
          {message}
        </HelperText>
      )}
    </div>
  );
}
