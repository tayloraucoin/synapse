/**
 * Warn on space-y-(--space-N) in JSX className literals — ineffective on typography
 * children (m-0). See docs/ai-guides/classnames.md § Spacing.
 *
 * Does not flag strings inside cn() — acceptable v1 limitation.
 *
 * @type {import("eslint").Linter.Config}
 */
export const spacingConfig = {
  files: ["**/*.{tsx,jsx}"],
  rules: {
    "no-restricted-syntax": [
      "warn",
      {
        selector:
          'JSXAttribute[name.name="className"] > Literal[value=/space-y-\\(--space-/]',
        message:
          "space-y-(--space-N) is ineffective on typography children (m-0). Use flex flex-col gap-(--space-N). See docs/ai-guides/classnames.md § Spacing.",
      },
    ],
  },
};
