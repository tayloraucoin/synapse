import type { CategoryKey } from "@syn/types";
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { CuratedIconGrid } from "./curated-icon-grid";

/**
 * Cells are labelled by the glyph's word, never its Lucide name: a person
 * choosing an icon for "Read" should hear "Book", not "book-open".
 *
 * The grid reads the same table `ItemIcon` renders from, so a glyph a person
 * can pick is always one the row can draw.
 */
const meta: Meta<typeof CuratedIconGrid> = {
  title: "Composed/Control/CuratedIconGrid",
  component: CuratedIconGrid,
  decorators: [(Story) => <div className="max-w-md p-(--space-6)"><Story /></div>],
};

export default meta;

export const Default: StoryObj = {
  render: function Render() {
    const [name, setName] = React.useState<string | null>("book-open");
    const [colorKey, setColorKey] = React.useState<CategoryKey | null>("sky");
    return (
      <CuratedIconGrid
        value={name}
        onChange={setName}
        colorKey={colorKey}
        onColorKeyChange={setColorKey}
      />
    );
  },
};

export const NoSearch: StoryObj = {
  render: function Render() {
    const [name, setName] = React.useState<string | null>(null);
    const [colorKey, setColorKey] = React.useState<CategoryKey | null>(null);
    return (
      <CuratedIconGrid
        search={false}
        value={name}
        onChange={setName}
        colorKey={colorKey}
        onColorKeyChange={setColorKey}
      />
    );
  },
};
