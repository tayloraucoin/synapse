import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TimePickerLists } from "@syn/ui/time-picker";

// USE-141 C2: the picker's lists are listboxes, the pick selected in words
// and a check, and a typed minute off the step is kept (time-picker.md).

function draw(value: string | null) {
  return renderToStaticMarkup(
    <TimePickerLists value={value} onPick={() => {}} />,
  );
}

describe("the picker's lists (C2; C-USE-set-my-days-time-picker-4)", () => {
  it("is two listboxes, Hour and Minute, with the pick aria-selected", () => {
    const html = draw("06:30");
    expect(html.match(/role="listbox"/g)).toHaveLength(2);
    expect(html).toContain(">Hour<");
    expect(html).toContain(">Minute<");
    expect(html.match(/aria-selected="true"/g)).toHaveLength(2);
    expect(html).toMatch(/aria-selected="true"[^>]*>6<svg/);
    expect(html).toMatch(/aria-selected="true"[^>]*>30<svg/);
    expect(html.match(/role="option"/g)).toHaveLength(24 + 12);
  });

  it("keeps a typed 7:03: the hour picked, no minute picked (C-5)", () => {
    const html = draw("07:03");
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-selected="true"[^>]*>7<svg/);
  });
});
