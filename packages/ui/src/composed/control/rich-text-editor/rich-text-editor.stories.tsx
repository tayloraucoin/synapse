import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Text } from "../../../primitives/typography/text";
import { RichTextEditor } from "./rich-text-editor";

/**
 * Five controls — bold · italic · quote · list · link — and Markdown at the
 * boundary (UX v1.2 §4.6). Type `**bold**` and read the Markdown beneath:
 * it comes back as `**bold**`. Paste a heading: it renders as a paragraph and
 * round-trips as the text without the `#`, because the extension is not
 * installed. `readOnly` is the same prose with no toolbar.
 */
const meta: Meta<typeof RichTextEditor> = {
  title: "Composed/Control/RichTextEditor",
  component: RichTextEditor,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

const SAMPLE = `The morning is the day's first draft.

> What you do first, you do *before* the day has an opinion about it.

- **Wake** before the phone.
- Read a [passage](https://example.com) slowly.
- Write three lines.`;

function Controlled(props: { initial: string; readOnly?: boolean; offline?: boolean; error?: string }) {
  const [md, setMd] = React.useState(props.initial);
  return (
    <div className="flex flex-col gap-(--space-4)">
      <RichTextEditor
        label="Passage"
        placeholder="A few lines to read in the morning."
        valueMd={md}
        onChangeMd={setMd}
        readOnly={props.readOnly}
        offline={props.offline}
        error={props.error}
      />
      {props.readOnly ? null : (
        <div className="flex flex-col gap-(--space-1)">
          <Text as="span" variant="caption" tone="secondary">
            Markdown out
          </Text>
          <pre className="bg-surface text-text-secondary m-0 overflow-x-auto rounded-(--radius) p-(--space-3) font-mono text-(length:--fs-caption) whitespace-pre-wrap">
            {md}
          </pre>
        </div>
      )}
    </div>
  );
}

export const Empty: StoryObj = { render: () => <Controlled initial="" /> };

export const Writing: StoryObj = { render: () => <Controlled initial={SAMPLE} /> };

/** Put the caret in the bold word: the Bold control reads pressed. */
export const ToolbarActive: StoryObj = { render: () => <Controlled initial="A **pressed** word." /> };

/** Select a word and press ⌘K (or the Link control): one field, Apply. */
export const LinkEditing: StoryObj = { render: () => <Controlled initial="Link this word." /> };

/** A heading in the input is a paragraph here and round-trips without the `#`. */
export const HeadingBecomesParagraph: StoryObj = {
  render: () => <Controlled initial={"# Not a heading\n\nJust a paragraph after it."} />,
};

export const ReadOnly: StoryObj = { render: () => <Controlled initial={SAMPLE} readOnly /> };

export const Offline: StoryObj = { render: () => <Controlled initial={SAMPLE} offline /> };

export const Error: StoryObj = {
  render: () => <Controlled initial="" error="A passage needs a few words before it can be saved." />,
};

/** Tab into the editor: the ring on the whole field. Reduced motion changes nothing here. */
export const FocusVisible: StoryObj = {
  render: function Render() {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      const timer = window.setTimeout(() => {
        ref.current?.querySelector<HTMLElement>("[role=textbox]")?.focus();
      }, 50);
      return () => window.clearTimeout(timer);
    }, []);
    return (
      <div ref={ref}>
        <Controlled initial={SAMPLE} />
      </div>
    );
  },
};
