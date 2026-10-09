/** One document in the search index (`app/search-index.json/route.ts`). */
export type SearchEntry = {
  id: string;
  title: string;
  description: string;
  headings: string;
  text: string;
  group: string;
  status: string;
  path: string;
  hidden: boolean;
};
