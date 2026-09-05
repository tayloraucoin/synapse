import React from "react";
import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";

import "../src/styles/globals.css";
import "./fonts.css";

/**
 * The toolbar theme switch writes `dark` on `<html>` — the same class
 * `ThemeProvider` writes in the app, so every token story re-renders through
 * the real `.dark` overrides rather than a Storybook-only approximation.
 */
const themeByClassName = withThemeByClassName({
  themes: { light: "", dark: "dark" },
  defaultTheme: "light",
});

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const themedStory = themeByClassName(Story, context);
      return React.createElement(
        "div",
        { className: "bg-paper text-ink box-border min-h-[280px] w-full p-8" },
        themedStory,
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    /** The theme wrapper paints the surface — the backgrounds addon would fight it. */
    backgrounds: { disable: true },
  },
};

export default preview;
