/**
 * @syn/validators — Zod schemas for forms and tRPC I/O.
 *
 * Pattern (conventions §4.6):
 * - Export both the schema and its z.infer type from the same module.
 * - One definition shared by the form (zodResolver) and the tRPC mutation.
 * - Platform-agnostic only (no next/*, DOM, or Node-only imports).
 * - Error messages are the UX documents' copy, verbatim — a message written
 *   twice is a message that drifts.
 */

export {
  DELETE_CONFIRMATION_WORD,
  accountFormSchema,
  dayTimeFormSchema,
  deleteAccountInput,
  exportDownloadInput,
  passwordChangeSchema,
  type AccountFormInput,
  type DayTimeFormInput,
  type DeleteAccountInput,
  type ExportDownloadInput,
  type PasswordChangeInput,
} from "./account";

export {
  deferItemInput,
  itemIdInput,
  rateItemInput,
  setDoneInput,
  setNoteInput,
  setQuantityInput,
  setWakeTimeInput,
  type SetDoneInput,
} from "./item";

export {
  notificationKindSchema,
  setNotificationPrefInput,
  type SetNotificationPrefInput,
} from "./notification";

export { feedbackInput, type FeedbackInput } from "./feedback";

export {
  shiftAmountSchema,
  shiftApplyInput,
  shiftIdInput,
  shiftPreviewInput,
  shiftReasonSchema,
  type ShiftApplyInput,
  type ShiftIdInput,
  type ShiftPreviewInput,
} from "./shift";

export {
  decideInput,
  decisionInput,
  habitWeekInput,
  reviewDayInput,
  reviewHistoryInput,
  reviewWeekInput,
  saveChangesInput,
  type DecideInput,
  type HabitWeekInput,
  type SaveChangesInput,
} from "./review";

export {
  missTierSchema,
  reasonArchiveInput,
  reasonFormSchema,
  reasonKeyInput,
  reasonUpdateInput,
  type ReasonFormInput,
} from "./reason";

export {
  displayNameSchema,
  emailSchema,
  forgotPasswordInput,
  passwordSchema,
  resetPasswordInput,
  signInInput,
  signUpInput,
  type DisplayName,
  type Email,
  type ForgotPasswordInput,
  type Password,
  type ResetPasswordInput,
  type SignInInput,
  type SignUpInput,
} from "./auth-credentials";

export {
  assetKindSchema,
  createUploadUrlInput,
  imageContentTypeSchema,
  setAvatarInput,
  type AssetKindInput,
  type CreateUploadUrlInput,
  type SetAvatarInput,
} from "./asset";

export {
  CATEGORY_NAME_TAKEN,
  categoryIdInput,
  categoryNameSchema,
  createCategoryInput,
  updateCategoryInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "./category";

export {
  categoryKeySchema,
  createFromStarterLibraryInput,
  createFromStarterSetInput,
  createHabitInput,
  habitFormSchema,
  habitIdInput,
  habitTypeSchema,
  iconValueSchema,
  listHabitsInput,
  rotationHabitSchema,
  slotsOutsideRangeInput,
  updateHabitInput,
  type CreateFromStarterLibraryInput,
  type CreateFromStarterSetInput,
  type HabitFormInput,
  type HabitTypeInput,
  type IconValueInput,
  type RotationHabitInput,
  type UpdateHabitInput,
} from "./habit";

export {
  anchorDirectionSchema,
  blockFlowSchema,
  blockKindSchema,
  blockOrderSchema,
  blockStructureSchema,
  createTemplateInput,
  dayShapeSchema,
  overflowModeSchema,
  scheduleShapeSchema,
  slotRoleSchema,
  trainingPlacementSchema,
  workDayModeSchema,
  workDaysSchema,
  type BlockKindInput,
  type CreateTemplateInput,
  type WorkDaysInput,
} from "./block";

export {
  fixtureFormSchema,
  fixtureIdInput,
  listFixturesInput,
  type FixtureFormInput,
} from "./fixture";

export {
  journalGetInput,
  journalPromptKeySchema,
  journalPromptsSchema,
  journalSaveInput,
  type JournalPromptsInput,
  type JournalSaveInput,
} from "./journal";

export {
  applyTrimInput,
  getDayInput,
  type ApplyTrimInput,
  type GetDayInput,
} from "./day";

export {
  dateKeySchema,
  weekKeySchema,
  type DateKey,
  type WeekKey,
} from "./keys";

export {
  clockTimeSchema,
  dayCloseTimeSchema,
  themePreferenceSchema,
  timezoneSchema,
  type ClockTime,
  type ThemePreference,
  type Timezone,
} from "./preferences";

export {
  snoozeInput,
  webPushSubscribeInput,
  type WebPushSubscribeInput,
} from "./push";

export {
  manualSessionInput,
  restorePayloadInput,
  sessionIdInput,
  updateSessionInput,
} from "./timer";

export {
  discardTemplateInput,
  listTemplatesInput,
  moveSlotInput,
  restoreSlotInput,
  schedulingSchema,
  slotFormSchema,
  slotIdInput,
  templateIdInput,
  templateLeaveSchema,
  templatePatchSchema,
  timeModeSchema,
  weekdaySchema,
  type RestoreSlotInput,
  type SlotFormInput,
  type TemplatePatchInput,
} from "./template";

export {
  updatePreferencesInput,
  type UpdatePreferencesInput,
} from "./user";

export {
  applyChangesInput,
  applyTemplateInput,
  changeAnchorInput,
  copyWeekInput,
  dayDateInput,
  oneOffFormSchema,
  removeOneOffInput,
  weekInput,
  type OneOffFormInput,
} from "./week";
