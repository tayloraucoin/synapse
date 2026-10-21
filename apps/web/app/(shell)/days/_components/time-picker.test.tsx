import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TimeField } from "@syn/ui/time-field";
import { TimePickerLists } from "@syn/ui/time-picker";
import { parseTypedClock } from "@syn/utils";

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

// USE-142 C1: TimeField is the house picker everywhere — a typeable field
// reading "7:05" with the clock at its end, never the browser's time input.
describe("TimeField (USE-142)", () => {
  const field = (props: Partial<React.ComponentProps<typeof TimeField>> = {}) =>
    renderToStaticMarkup(
      <TimeField
        label={<span className="sr-only">Starts</span>}
        name="Starts"
        value="07:05"
        onChange={() => {}}
        {...props}
      />,
    );

  it("reads the time compact, 7:05, in a text field", () => {
    const html = field();
    expect(html).toMatch(/<input[^>]*type="text"[^>]*value="7:05"/);
    expect(html).not.toContain('type="time"');
  });

  it("puts the clock at its end, named with the field and its time", () => {
    expect(field()).toContain('aria-label="Choose a time for Starts, 7:05"');
    expect(field({ value: null })).toContain(
      'aria-label="Choose a time for Starts"',
    );
  });

  it("reads typing as the field does: 630 is 06:30, any minute kept", () => {
    expect(parseTypedClock("630")).toBe("06:30");
    expect(parseTypedClock("7:03")).toBe("07:03");
  });
});
