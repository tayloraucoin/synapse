import { describe, expect, it } from "vitest";
import { mealTopicUrl } from "./meal-topic";

describe("mealTopicUrl (C4)", () => {
  it("opens a playlist at the URL as saved", () => {
    const url = "https://www.youtube.com/playlist?list=PLagent0001";
    expect(mealTopicUrl({ linkKind: "playlist", linkValue: url })).toBe(url);
  });

  it("opens a channel at youtube.com/@<handle>, with or without the @", () => {
    expect(
      mealTopicUrl({ linkKind: "channel", linkValue: "@strengthdaily" }),
    ).toBe("https://www.youtube.com/@strengthdaily");
    expect(
      mealTopicUrl({ linkKind: "channel", linkValue: "strengthdaily" }),
    ).toBe("https://www.youtube.com/@strengthdaily");
  });

  it("opens a search as a results URL with the words encoded", () => {
    const url = mealTopicUrl({
      linkKind: "search",
      linkValue: "roman history & documentary",
    });
    expect(url).toBe(
      "https://www.youtube.com/results?search_query=roman+history+%26+documentary",
    );
    expect(new URL(url).searchParams.get("search_query")).toBe(
      "roman history & documentary",
    );
  });
});
