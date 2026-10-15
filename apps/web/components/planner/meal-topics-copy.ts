import type { MealTopicLinkKind } from "@syn/utils";

/**
 * The words of a meal's topics and the Meal topics sheet (USE-22;
 * day/now/states/meal-pick-topic, meal-topic-picked; interactions/meal-topics).
 */
export const MEAL_TOPICS_COPY = {
  heading: "Watching while eating",
  editTopics: "Edit topics",
  pickFirst: "Pick one before opening YouTube.",
  picked: "Picked for this meal. Tap another to change.",
  open: "Open in YouTube",
  /** The callout's second line: "<topic> · saved playlist". */
  openLine: (name: string, kind: MealTopicLinkKind) =>
    `${name} · ${KIND_WORD[kind]}`,
  announcePicked: (name: string) => `${name} picked for this meal.`,

  sheet: {
    title: "Meal topics",
    line: "Things worth watching while cooking and eating. Each opens a saved playlist, a channel, or a YouTube search.",
    close: "Close",
    list: "Meal topics",
    add: "Add a topic",
    /** The row's muted line: the link's kind and value. */
    link: (kind: MealTopicLinkKind, value: string) =>
      kind === "search"
        ? `Search · "${value}"`
        : `${KIND_LABEL[kind]} · ${kind === "playlist" ? shortUrl(value) : value}`,
    editRow: (name: string) => `Edit ${name}`,
    removed: (name: string) => `${name} removed.`,
    deleteHint: "Swipe left to delete.",
  },

  edit: {
    newTitle: "New topic",
    editTitle: "Edit topic",
    back: "Meal topics",
    backLabel: "Back to Meal topics",
    icon: "Icon",
    chooseIcon: (name: string) =>
      name === "" ? "Choose an icon" : `Choose an icon for ${name}`,
    name: "Name",
    link: "Opens",
    value: {
      playlist: "Playlist link",
      channel: "Channel handle",
      search: "Search words",
    } satisfies Record<MealTopicLinkKind, string>,
    placeholder: {
      playlist: "youtube.com/playlist?list=…",
      channel: "@handle",
      search: "roman history documentary",
    } satisfies Record<MealTopicLinkKind, string>,
    save: "Save",
    add: "Add topic",
    delete: "Delete topic",
    needsName: "Give it a name.",
    needsLink: "Add where it opens.",
  },
} as const;

/** The callout's kind word [ASSUMPTION: "channel" and "search" beside the drawn "saved playlist"]. */
const KIND_WORD: Record<MealTopicLinkKind, string> = {
  playlist: "saved playlist",
  channel: "channel",
  search: "search",
};

export const KIND_LABEL: Record<MealTopicLinkKind, string> = {
  playlist: "Playlist",
  channel: "Channel",
  search: "Search",
};

/** A playlist URL as the row shows it: no scheme, no www. */
function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
}
