import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Caption, Text } from "../primitives/typography/text";
import {
  CATEGORY_KEYS,
  LEGACY_ALIASES,
  RAMPS,
  RAMP_STEPS,
  ROLE_TOKENS,
  categoryChipToken,
  categoryDotToken,
  rampToken,
  type RampName,
} from "./tokens";

/**
 * The token sheet, from the brand kit (WEB-1). Toggle the toolbar theme to
 * check both registers — the raw ramps are theme-independent by design, the
 * roles and the category pairs are not.
 *
 * Each swatch prints its token name and the hex the browser actually computed,
 * so a value that drifted from the kit's tokens.json is visible rather than
 * inferred.
 */

/**
 * Read what the browser actually painted.
 *
 * Two steps, both necessary. A probe element resolves `var()` down to a
 * single computed colour — the ramps are `oklch(…)`, which a regex cannot
 * turn into the painted sRGB. That computed colour then goes onto a 1x1
 * canvas, which hands back the bytes on screen.
 */
function computedColor(token: string): string {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

function toHex(color: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return color;

  context.fillStyle = "#000";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);

  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

/** Re-read when the theme class changes, so the sheet is honest in both. */
function useTokenHex(token: string): string {
  const [hex, setHex] = React.useState("");

  React.useEffect(() => {
    const read = () => setHex(toHex(computedColor(token)));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [token]);

  return hex;
}

function Swatch({ token, note }: { token: string; note?: string }) {
  const hex = useTokenHex(token);

  return (
    <div className="flex w-40 flex-col gap-(--space-1)">
      <div
        className="border-hairline h-14 w-full rounded-(--radius) border"
        style={{ background: `var(${token})` }}
      />
      <Caption as="span" className="break-all">
        {token}
      </Caption>
      <Caption as="span" tone="muted">
        {hex}
        {note ? ` · ${note}` : ""}
      </Caption>
    </div>
  );
}

function Row({
  title,
  children,
  note,
}: {
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <section className="flex flex-col gap-(--space-3)">
      <div className="flex flex-col gap-(--space-1)">
        <Text as="h2" variant="row-title">
          {title}
        </Text>
        {note ? <Caption as="span">{note}</Caption> : null}
      </div>
      <div className="flex flex-wrap gap-(--space-3)">{children}</div>
    </section>
  );
}

const meta: Meta = {
  title: "Branding/Palette",
  parameters: { layout: "fullscreen" },
};

export default meta;

const RAMP_NOTES: Record<RampName, { title: string; note: string }> = {
  neutral: {
    title: "Neutral — warm paper to ink",
    note: "50 is paper, the light background; 900 is ink, the text and the dark background.",
  },
  brand: {
    title: "Brand — verdigris",
    note: "500 is the brand value: lines, dots and the focus ring, never text. Text in the brand colour is link (600 light, 400 dark).",
  },
  violet: {
    title: "Violet — off schedule",
    note: "One meaning only: something happened outside its planned time. Never decoration.",
  },
  red: {
    title: "Red — destructive",
    note: "Delete account and nowhere else. Missed, errors and warnings are never red.",
  },
};

export const Palette: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-(--space-12) p-(--space-8)">
      <Row
        title="Roles"
        note="What components reference. These flip with the theme; the raw ramps below do not."
      >
        {ROLE_TOKENS.map((token) => (
          <Swatch key={token} token={token} />
        ))}
      </Row>

      <Row
        title="Categories"
        note="Chip fill with the name in foreground, and the dot. Always printed beside the name."
      >
        {CATEGORY_KEYS.flatMap((key) => [
          <Swatch key={`${key}-chip`} token={categoryChipToken(key)} />,
          <Swatch key={`${key}-dot`} token={categoryDotToken(key)} />,
        ])}
      </Row>

      {RAMPS.map((ramp) => (
        <Row key={ramp} title={RAMP_NOTES[ramp].title} note={RAMP_NOTES[ramp].note}>
          {RAMP_STEPS.map((step) => (
            <Swatch key={step} token={rampToken(ramp, step)} />
          ))}
        </Row>
      ))}

      <Row
        title="Legacy aliases"
        note="Older names, each resolving to a role until a codemod retires them. Never used in new code."
      >
        {Object.entries(LEGACY_ALIASES).map(([alias, role]) => (
          <Swatch key={alias} token={alias} note={`= ${role}`} />
        ))}
      </Row>
    </div>
  ),
};
