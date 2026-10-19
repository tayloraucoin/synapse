/**
 * The colour popover's maths (USE-11): `#rrggbb` to hue, saturation and
 * value and back, the hex field's parse, and the darkening that keeps a very
 * light pick readable on paper (the dev note: "as Linear does").
 *
 * Hex here is a person's colour, data like a name; it is never a style value
 * of the app's own, which stay tokens.
 */

export interface Hsv {
  /** 0 to 360. */
  h: number;
  /** 0 to 1. */
  s: number;
  /** 0 to 1. */
  v: number;
}

const HEX6 = /^#?([0-9a-f]{6})$/i;

/** What the hex field holds, to `#rrggbb` lower case, or null when it is not a colour. */
export function parseHex(text: string): string | null {
  const match = HEX6.exec(text.trim());
  return match ? `#${match[1]!.toLowerCase()}` : null;
}

/** `#2f6f62` as the boards show it: "2F6F62". */
export function displayHex(hex: string): string {
  return hex.replace(/^#/, "").toUpperCase();
}

function channels(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hexToHsv(hex: string): Hsv {
  const [r, g, b] = channels(hex).map((c) => c / 255) as [
    number,
    number,
    number,
  ];
  const max = Math.max(r, g, b);
  const delta = max - Math.min(r, g, b);
  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const c = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Above this a line icon on paper stops reading; picks are darkened under it. */
const LIGHTEST = 0.45;

/**
 * A very light pick, darkened a little so the icon stays readable on paper.
 * The hue and saturation are kept; only the value comes down, and only as
 * far as it must.
 */
export function readableOnPaper(hex: string): string {
  if (luminance(hex) <= LIGHTEST) return hex;
  const hsv = hexToHsv(hex);
  let next = hex;
  for (let v = hsv.v; v > 0 && luminance(next) > LIGHTEST; v -= 0.02) {
    next = hsvToHex({ ...hsv, v });
  }
  return next;
}
