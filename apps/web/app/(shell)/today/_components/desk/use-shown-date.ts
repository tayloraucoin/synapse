"use client";

import { useQueryState } from "nuqs";
import { dateKeySchema } from "@syn/validators";
import { useTodayKey } from "@/lib/data/use-morning";
import { TODAY_DATE_PARAM } from "@/lib/routes";

/**
 * The date the desk's Today shows (USE-58): `?date=` when it is a date and
 * not today, else today. An opened date is planning (D-USE-41); today's own
 * date is never opened, so its strip card goes to Today itself.
 */
export function useShownDate(): {
  todayKey: string;
  dateKey: string;
  opened: boolean;
} {
  const todayKey = useTodayKey();
  const [param] = useQueryState(TODAY_DATE_PARAM);
  const parsed = dateKeySchema.safeParse(param);
  const dateKey = parsed.success ? parsed.data : todayKey;
  return { todayKey, dateKey, opened: dateKey !== todayKey };
}
