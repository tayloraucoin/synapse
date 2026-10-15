"use client";

import Link from "next/link";
import { Button, Text } from "@syn/ui";
import { todayScheduleRoute } from "@/lib/routes";
import { NOW_COPY as COPY } from "./copy";

/**
 * After the day's last block (USE-20; now/states/empty-no-blocks.md): no
 * block header and no rows; centred under the open tray, "The day's blocks
 * are done." and See the whole day, which opens Schedule. Nothing counts
 * what was done or left.
 */
export function NowEmpty() {
  return (
    <div
      data-now-empty=""
      className="flex flex-1 flex-col items-center justify-center gap-(--space-4) px-(--space-4) py-(--space-12)"
    >
      <Text as="p" variant="body" weight={500} className="text-center">
        {COPY.blocksDone}
      </Text>
      <Button asChild variant="secondary">
        <Link href={todayScheduleRoute()}>{COPY.seeTheWholeDay}</Link>
      </Button>
    </div>
  );
}
