/**
 * TemplateUsageRow — how often a template was used (v2 handoff §5.9).
 *
 * A `ListRow` preset for WR-01: name, then "2 of 2" against a weekly target
 * or "used 3" without one. Tabular so a column of them lines up.
 *
 * Reaching the target is not celebrated and missing it is not marked. The row
 * states the count; the person decides what it means (official spec §2.4).
 */
import * as React from "react";

import { ListRow } from "../list-row";

export interface TemplateUsageRowProps {
  name: string;
  used: number;
  target: number | null;
  className?: string;
}

export function TemplateUsageRow({
  name,
  used,
  target,
  className,
}: TemplateUsageRowProps) {
  return (
    <ListRow
      title={name}
      layout="wide"
      meta={target === null ? `used ${used}` : `${used} of ${target}`}
      className={className}
    />
  );
}
