import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Caption, Text } from "../primitives/typography/text";
import {
  ACCENT_STEPS,
  CATEGORY_DERIVED_STEPS,
  CATEGORY_KEYS,
  CATEGORY_STEPS,
  DESTRUCTIVE_TOKEN,
  NEUTRAL_STEPS,
  SEMANTIC_TOKENS,
  accentToken,
  categoryToken,
  neutralToken,
  violetToken,
} from "./tokens";

/**
 * The token sheet. Toggle the toolbar theme to check both registers — the
 * raw scales are theme-independent by design, the semantic row is not.
 *
 * Each swatch prints its token name and the hex the browser actually computed,
 * so a value that drifted from official spec §9.3 is visible rather than
 * inferred.
 */

/**
 * Read what the browser actually painted.
 *
 * Two steps, both necessary. A probe element resolves `var()` and
 * `color-mix()` down to a single computed colour — the derived category steps
 * are `color-mix(in oklch, …)`, which neither a canvas nor a regex can read in
 * source form. That computed colour then goes onto a 1x1 canvas, because
 * Chrome serialises an oklch mix as `oklch(…)` and pulling the numbers out of
 * that string yields a colour that is not the one on screen.
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

export const Palette: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-(--space-7) p-(--space-6)">
      <Row
        title="Neutral — warm ink and paper"
        note="The ground. 50 is paper, 800 is ink, 900 is paper in dark."
      >
        {NEUTRAL_STEPS.map((step) => (
          <Swatch key={step} token={neutralToken(step)} />
        ))}
      </Row>

      <Row
        title="Accent — verdigris"
        note="The now line, the now/soon marker, the focus ring, links, the active-timer border. Never a button fill, never a wash."
      >
        {ACCENT_STEPS.map((step) => (
          <Swatch key={step} token={accentToken(step)} />
        ))}
      </Row>

      <Row
        title="Violet — off-schedule"
        note="Time text, the moved-block border, shift bands. The only semantic colour with its own scale."
      >
        {ACCENT_STEPS.map((step) => (
          <Swatch key={step} token={violetToken(step)} />
        ))}
      </Row>

      <Row
        title="Destructive — reserved"
        note="Permitted on exactly one surface: Delete account. Not on 'Missed', which is neutral."
      >
        <Swatch token={DESTRUCTIVE_TOKEN} />
      </Row>

      {CATEGORY_KEYS.map((key) => (
        <Row
          key={key}
          title={`Category — ${key}`}
          note="100/500/700 are authored (§9.3). 200/800 are derived by color-mix and are [PROPOSED — needs sign-off]."
        >
          {CATEGORY_STEPS.map((step) => (
            <Swatch
              key={step}
              token={categoryToken(key, step)}
              note={
                (CATEGORY_DERIVED_STEPS as readonly number[]).includes(step)
                  ? "PROPOSED"
                  : undefined
              }
            />
          ))}
        </Row>
      ))}

      <Row
        title="Semantic"
        note="What components reference. These flip with the theme; the raw scales above do not."
      >
        {SEMANTIC_TOKENS.map((token) => (
          <Swatch key={token} token={token} />
        ))}
      </Row>
    </div>
  ),
};
