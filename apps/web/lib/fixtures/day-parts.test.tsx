import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { findPart } from "./parts";

// USE-10: each registered part draws its forms from props alone.

function draw(name: string): string {
  const render = findPart(name);
  if (!render) throw new Error(`${name} is not registered`);
  return renderToStaticMarkup(<>{render()}</>);
}

describe("USE-10 parts on /dev/parts", () => {
  it("work-row: idle, Next, firing and done", () => {
    const html = draw("work-row");
    expect(html).toContain('data-form="idle"');
    expect(html).toContain('data-form="next"');
    expect(html).toContain('data-form="firing"');
    expect(html).toContain('data-form="done"');
    // Firing: the halo mark and its words in rust, never verdigris.
    expect(html).toMatch(/data-firing-mark=""[^>]*data-breathing="true"/);
    expect(html).toContain("text-firing-text");
    expect(html).not.toContain("bg-now");
    // Done: the record, "fired" kept because it fired.
    expect(html).toContain("Took 1 h 10 · fired 32 min");
    expect(html).toContain("No Linear");
    expect(html).toContain("3 Medium");
  });

  it("tier-and-item: Urgent hidden while empty; squares beside their words; the reminder once", () => {
    const html = draw("tier-and-item");
    expect(html).not.toContain('data-tier-group="urgent"');
    for (const [tier, hue] of [
      ["primary", "leaf"],
      ["secondary", "amber"],
      ["stretch", "slate"],
    ])
      expect(html).toMatch(
        new RegExp(
          `data-tier-group="${tier}"[\\s\\S]*?data-hue-square="${hue}"`,
        ),
      );
    expect(html.match(/data-while-it-fires/g)).toHaveLength(1);
    expect(html).toContain("daily · 10:00");
    expect(html).toContain('data-checked="true"');
  });

  it("block-band-and-header: the kind's colour, name and span; Step away only when asked", () => {
    const html = draw("block-band-and-header");
    expect(html).toContain('data-day-block-band="work"');
    expect(html).toContain("bg-category-sky-chip");
    expect(html.match(/data-day-block-header="work"/g)).toHaveLength(2);
    expect(html.match(/Step away/g)).toHaveLength(1);
  });
});
