import { CompleteBlockIcon, EditBlockIcon, WholeDayIcon } from "@syn/ui";
import type { NowBlockMenuRow } from "@/components/planner";
import { todayBlockRoute, todayScheduleRoute } from "@/lib/routes";
import { NOW_COPY as COPY } from "./copy";

/**
 * ··· on Now's header (USE-17; now/states/header-menu.md), in the canvas's
 * order: Complete <Block> (the close card, USE-25's), Edit block (the Block
 * view), a separator, See the whole day (Schedule; go mode stays).
 */
export function nowBlockMenuRows(
  block: { id: string; name: string },
  onComplete: () => void,
): NowBlockMenuRow[] {
  return [
    {
      label: COPY.completeBlock(block.name),
      icon: CompleteBlockIcon,
      onSelect: onComplete,
    },
    {
      label: COPY.editBlock,
      icon: EditBlockIcon,
      href: todayBlockRoute(block.id),
    },
    {
      label: COPY.seeTheWholeDay,
      icon: WholeDayIcon,
      href: todayScheduleRoute(),
      separated: true,
    },
  ];
}
