/**
 * LB-02's strings — Epic 1 §3 and §9, verbatim.
 *
 * The validation messages are NOT here: they live in `@syn/validators`'
 * `habit.ts`, because the form's resolver and the procedure share one schema
 * and a message written in two places is a message that drifts. What is here
 * is everything the sheet says that is not an error.
 */

export const HABIT_SHEET_COPY = {
  createTitle: "New habit",
  editTitle: "Edit habit",
  /** UX v1.2 §4, the frame rules — the sheet names the noun (RUN-10). */
  stepTitle: "A step before work",
  morningHabitTitle: "A morning habit",
  chooseAnIcon: "Choose an icon",
  /** [COPY — needs Vesper sign-off] */
  quickSaveError: "Couldn’t save. Try again.",
  /** Edit mode, under the title, linking to LB-03. */
  usageLink: (count: number) =>
    `In ${count} ${count === 1 ? "template" : "templates"}`,

  name: "Name",
  type: "Type",
  icon: "Icon",
  category: "Category",
  /** UX v1.1 §4.15 — the block chip row: five words, the kinds a habit can live in. */
  block: "Block",
  blockMorning: "Morning",
  blockBeforeWork: "Before work",
  blockBreak: "Break",
  blockWindDown: "Wind-down",
  blockAnywhere: "Anywhere",
  range: "Time it might take",
  importance: "How important is this to your life?",
  importanceHelper:
    "This becomes its default priority. You can change it per template.",

  typeOptions: {
    habit: "Habit",
    task_appointment: "Task / appointment",
    deep_work: "Deep work",
  },
  /** One line that changes with the selection (Epic 1 LB-02 read 3). */
  typeHelpers: {
    habit: "Habits reset each week.",
    task_appointment: "Tasks carry forward until done.",
    deep_work: "A timed block. What you work on lives elsewhere.",
  },
  /** The range helper differs by type: required for two of the three. */
  rangeHelperRequired: "Required for this type.",
  rangeHelperOptional: "Optional for a task or appointment.",

  more: "More",
  quantity: "Quantity",
  quantityHelper:
    "Optional. Adds a number to capture when you mark it done — pages, reps, minutes.",
  quantityPlaceholder: "e.g. pages",
  reflection: "Reflection",
  reflectionHelper: "Optional. Up to two things to rate 1–7 after you do it.",
  reflectionPlaceholder: "e.g. focus",
  addAnother: "Add another",
  note: "Note before starting",
  noteHelper: "Optional. Shown on the item before you start.",

  cancel: "Cancel",
  save: "Save",
  saveChanges: "Save changes",
  /** The archived read-only footer. */
  restore: "Restore",
  close: "Close",

  /** Non-blocking; the person may keep the name (Epic 1 LB-02). */
  duplicateName: "You already have a habit called this.",
  /** Shown in edit when the habit is in templates and the type changed. */
  typeChangeKeepsTemplates: "Changing type keeps it in your templates.",
  formError: "Couldn't save. Try again.",
  offline: "You're offline — sign-in needs a connection.",

  /** The range-narrowing dialog, before save. */
  rangeWarningTitle: "Save anyway?",
  rangeWarningBody: (count: number) =>
    `${count} template ${count === 1 ? "slot uses" : "slots use"} a duration outside this range. They'll keep their duration; you can adjust them in the template.`,
  rangeWarningConfirm: "Save anyway",

  /** The icon chooser. */
  iconTabs: { emoji: "Emoji", curated: "Icon", image: "Image" },
  useImage: "Use image",
  chooseAnother: "Choose another",
  removeImage: "Remove image",
  uploading: "Uploading…",
  newCategory: "+ New category",
  noneCategory: "None",
} as const;
