import type { AnchorHTMLAttributes, ReactNode } from "react";

/** Storybook shim — components use `next/link`; apps use the real module. */
export default function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
}) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
