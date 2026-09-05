import type { MetadataRoute } from "next";

/**
 * The PWA manifest — cross-cutting §5.1.
 *
 * `theme_color` and `background_color` are the LIGHT paper (`--syn-neutral-50`),
 * not a per-theme value: a manifest is static, read once at install, and
 * cannot follow `prefers-color-scheme`. The splash is therefore always light;
 * the in-app `themeColor` viewport entry (root layout) is the one that follows
 * the theme. Picking the dark ground here would flash dark before a light app.
 *
 * `orientation: "portrait"` matches §5.1. Landscape on a wide screen is a CSS
 * matter — the manifest lock applies to handhelds, where the product is a
 * single column.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Synapse",
    short_name: "Synapse",
    description:
      "A private daily list. Habits, tasks, appointments, and deep work in one place, closed honestly each night.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#FAFAF8",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["productivity", "lifestyle"],
  };
}
