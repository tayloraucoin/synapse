"use client";

import { useSearchParams } from "next/navigation";
import { useDataSource } from "@/lib/data/source";
import type { TodayBlockFrom } from "@/lib/routes";
import { blockViewFrom } from "./nav-items";

/**
 * Where the Block view on screen was opened (USE-48): `?from=`, else the
 * scenario's `openedFrom` so a bare `?state=` capture lands as drawn. The
 * shell reads it for the tabs and the focused frame.
 */
export function useBlockViewFrom(): TodayBlockFrom | null {
  const search = useSearchParams();
  const fallback = useDataSource().scenario.openedFrom ?? null;
  return blockViewFrom(search, fallback);
}
