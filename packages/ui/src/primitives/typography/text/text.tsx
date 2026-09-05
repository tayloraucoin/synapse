/**
 * Text — the one typography primitive. Every label, row, caption, and heading
 * is a `Text`, so the scale cannot drift (v2 handoff §5.1).
 *
 * TOKEN BINDINGS: the `tone` axis maps to semantic tokens that flip inside
 * `.dark` on their own, so a component never writes a `dark:` colour and never
 * holds two values for one idea.
 *
 * ELEMENT DEFAULTS: when `variant` is omitted, h1–h6 infer "heading"; every
 * other element defaults to "body". An explicit `variant` always wins, so
 * `<Text as="h2" variant="body">` is legal and sometimes right — the tag is
 * document structure, the variant is size.
 *
 * TABULAR FIGURES are on globally (`body` in globals.css). `tabular={false}`
 * is the opt-out for prose; there is no opt-in, because the default is on.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  inferVariantFromElement,
  textVariants,
  type TextTone,
  type TextVariant,
} from "./text.variants";

export type { TextTone, TextVariant };

export interface TextClasses {
  root?: string;
}

type TextOwnProps = {
  /** Type scale variant. Default: "body"; h1–h6 infer "heading". */
  variant?: TextVariant;
  /** Colour emphasis. Default: "ink". */
  tone?: TextTone;
  /** Overrides the variant's own weight. */
  weight?: 400 | 500 | 600;
  /** Default true globally; pass false for prose. */
  tabular?: boolean;
  /** text-wrap: balance — for headings and short review sentences. */
  balance?: boolean;
  /** Single-line ellipsis truncation. */
  truncate?: boolean;
  classes?: TextClasses;
  className?: string;
  children?: React.ReactNode;
};

export type TextProps<E extends React.ElementType = "span"> = TextOwnProps &
  Omit<React.ComponentPropsWithoutRef<E>, keyof TextOwnProps | "as"> & {
    as?: E;
  };

function TextInner<E extends React.ElementType = "span">(
  {
    as,
    variant,
    tone,
    weight,
    tabular,
    balance,
    truncate,
    classes,
    className,
    children,
    ...props
  }: TextProps<E>,
  ref: React.Ref<Element>,
) {
  const Component = (as ?? "span") as React.ElementType;
  const tagName = typeof Component === "string" ? Component : "span";
  const resolvedVariant = variant ?? inferVariantFromElement(tagName) ?? "body";

  return (
    <Component
      ref={ref}
      className={cn(
        textVariants({
          variant: resolvedVariant,
          tone: tone ?? "ink",
          weight,
          tabular,
        }),
        balance && "text-balance",
        truncate && "truncate",
        classes?.root,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

const Text = React.forwardRef(TextInner) as <
  E extends React.ElementType = "span",
>(
  props: TextProps<E> & { ref?: React.Ref<Element> },
) => React.ReactElement | null;

(Text as { displayName?: string }).displayName = "Text";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * The screen heading. One `h1` per screen (cross-cutting §11) — that is the
 * consumer's rule, which is why `as` is a prop and not a constant. Every
 * heading level renders at the same size; the level is document structure.
 */
function Heading<E extends HeadingTag = "h1">(props: TextProps<E>) {
  const { as, variant = "heading", tone = "ink", ...rest } = props;
  return (
    <Text as={(as ?? "h1") as HeadingTag} variant={variant} tone={tone} {...rest} />
  );
}
Heading.displayName = "Heading";

/** Smallest text — helper lines, square labels, the quiet weighting line. */
function Caption<E extends React.ElementType = "span">(props: TextProps<E>) {
  const { as, variant = "caption", tone = "secondary", ...rest } = props;
  return (
    <Text
      as={(as ?? "span") as React.ElementType}
      variant={variant}
      tone={tone}
      {...rest}
    />
  );
}
Caption.displayName = "Caption";

/** The muted second line — template name, section span, "from Thu". */
function Meta<E extends React.ElementType = "span">(props: TextProps<E>) {
  const { as, variant = "secondary", tone = "secondary", ...rest } = props;
  return (
    <Text
      as={(as ?? "span") as React.ElementType}
      variant={variant}
      tone={tone}
      {...rest}
    />
  );
}
Meta.displayName = "Meta";

export { Text, Heading, Caption, Meta, textVariants };
