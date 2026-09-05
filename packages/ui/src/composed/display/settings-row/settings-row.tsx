/**
 * SettingsRow — a `ListRow` preset for ST-00 (v2 handoff §5.5).
 *
 * Title, description, chevron, `href`. It exists so the settings index cannot
 * drift row by row: every entry is the same shape because there is only one
 * way to write one.
 */
import { ChevronRight } from "lucide-react";
import * as React from "react";

import { ListRow } from "../list-row";

export interface SettingsRowProps {
  title: string;
  description?: React.ReactNode;
  href: string;
  className?: string;
}

export function SettingsRow({
  title,
  description,
  href,
  className,
}: SettingsRowProps) {
  return (
    <ListRow
      title={title}
      meta={description}
      href={href}
      className={className}
      trailing={
        <ChevronRight
          className="size-4 text-text-secondary"
          aria-hidden="true"
        />
      }
    />
  );
}
