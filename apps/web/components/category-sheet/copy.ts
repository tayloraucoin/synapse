/**
 * CT-01 and CT-02's strings — Epic 1 §4, verbatim.
 *
 * The duplicate-name sentence is NOT here: it is `CATEGORY_NAME_TAKEN` in
 * `@syn/validators`, because the server returns it too and one sentence with
 * two homes is a sentence that drifts.
 */
export const CATEGORY_COPY = {
  listTitle: "Categories",
  add: "Add",
  habitCount: (count: number) =>
    `${count} ${count === 1 ? "habit" : "habits"}`,
  emptyText:
    "No categories yet. They group your time in the week review — wellness, work, whatever you like.",
  emptyAction: "Add a category",

  createTitle: "New category",
  editTitle: "Edit category",
  name: "Name",
  colour: "Colour",
  cancel: "Cancel",
  save: "Save",

  deleteTitle: (name: string) => `Delete ${name}?`,
  deleteBody: (count: number) =>
    `${count} ${count === 1 ? "habit" : "habits"} will have no category. Past reports keep the name.`,
  delete: "Delete",
  keep: "Keep",

  /**
   * [COPY — needs Vesper sign-off: the document gives no sentence for an
   * empty category name, because the field is simply required. This is the
   * shortest true statement in the product's register.]
   */
  nameRequired: "Give it a name.",
  failed: "Couldn't save. Try again.",
  offline: "You're offline — sign-in needs a connection.",
} as const;
