/**
 * Meal topics (USE-22; D-USE-28): where a topic opens on YouTube. The link
 * is built from the saved kind and value, never typed by hand: a playlist's
 * URL as saved, a channel's handle on youtube.com, a search's words as a
 * results URL.
 */

export type MealTopicLinkKind = "playlist" | "channel" | "search";

export interface MealTopicLink {
  linkKind: MealTopicLinkKind;
  linkValue: string;
}

const YOUTUBE = "https://www.youtube.com";

/** The topic's playlist, channel or search on youtube.com. */
export function mealTopicUrl({ linkKind, linkValue }: MealTopicLink): string {
  const value = linkValue.trim();
  switch (linkKind) {
    case "playlist":
      return value;
    case "channel":
      return `${YOUTUBE}/@${encodeURIComponent(value.replace(/^@/, ""))}`;
    case "search":
      return `${YOUTUBE}/results?${new URLSearchParams({ search_query: value }).toString()}`;
  }
}
