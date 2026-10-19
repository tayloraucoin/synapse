import { renderToStaticMarkup } from "react-dom/server";
import { ItemIcon } from "@syn/ui";
import { describe, expect, it } from "vitest";

// USE-144: a Lucide icon set in the picker draws wherever it is shown — the
// New block tile, Block view rows, the block's ··· — not the empty dot.

describe("ItemIcon with a Lucide icon", () => {
  it("draws in the kind's dot colour, not the empty dot", () => {
    const html = renderToStaticMarkup(
      <ItemIcon icon={{ kind: "lucide", value: "sun", color: "amber" }} />,
    );
    expect(html).toContain("text-category-amber-dot");
    expect(html).not.toContain("bg-edge");
  });

  it("draws a custom colour as its hex", () => {
    const html = renderToStaticMarkup(
      <ItemIcon icon={{ kind: "lucide", value: "sun", color: "#3366cc" }} />,
    );
    expect(html).toContain("color:#3366cc");
    expect(html).not.toContain("bg-edge");
  });

  it("keeps the empty dot for no icon", () => {
    expect(renderToStaticMarkup(<ItemIcon icon={null} />)).toContain("bg-edge");
  });
});
