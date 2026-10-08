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
  orientInput,
  rateItemInput,
  saveMorningInput,
  setDoneInput,
  setNoteInput,
  setQuantityInput,
  setWakeTimeInput,
  type SaveMorningInput,
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
  confirmLastNightInput,
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
  createHabitInput,
  createStepInput,
  habitFormSchema,
  habitIdInput,
  habitPatchSchema,
  habitTypeSchema,
  habitVersionSchema,
  habitVersionsSchema,
  iconValueSchema,
  listHabitsInput,
  patchHabitInput,
  patchWorkoutInput,
  rotationHabitSchema,
  slotsOutsideRangeInput,
  updateHabitInput,
  versionKeySchema,
  workoutDetailsSchema,
  workoutPatchSchema,
  type CreateFromStarterLibraryInput,
  type CreateStepInput,
  type HabitFormInput,
  type HabitPatchInput,
  type HabitTypeInput,
  type HabitVersionInput,
  type IconValueInput,
  type PatchHabitInput,
  type PatchWorkoutInput,
  type RotationHabitInput,
  type UpdateHabitInput,
  type WorkoutDetailsInput,
  type WorkoutPatchInput,
} from "./habit";

export {
  anchorDirectionSchema,
  blockFlowSchema,
  blockKindSchema,
  blockOrderSchema,
  blockStructureSchema,
  createTemplateInput,
  dayPlanStateSchema,
  dayShapeSchema,
  fixtureKindSchema,
  morningModeSchema,
  overflowModeSchema,
  scheduleShapeSchema,
  slotRoleSchema,
  trainingPlacementSchema,
  workDayKindSchema,
  workDayModeSchema,
  workDaysSchema,
  workoutLocationSchema,
  type BlockKindInput,
  type CreateTemplateInput,
  type WorkDaysInput,
} from "./block";

export {
  completeDayPlanInput,
  createDayPlanInput,
  dayPlanBreakSchema,
  dayPlanIdInput,
  dayPlanPatchSchema,
  dayPlanTrainingSchema,
  listDayPlansInput,
  updateDayPlanInput,
  type CompleteDayPlanInput,
  type DayPlanPatchInput,
  type UpdateDayPlanInput,
} from "./day-plan";

export {
  passageFormSchema,
  passageIdInput,
  reorderPassagesInput,
  type PassageFormInput,
  type ReorderPassagesInput,
} from "./passage";
export {
  linkFormSchema,
  linkIdInput,
  listLinksInput,
  reorderLinksInput,
  type LinkFormInput,
} from "./link";

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
  applyWorkTypeInput,
  getDayInput,
  removeWorkTypeInput,
  type ApplyTrimInput,
  type ApplyWorkTypeInput,
  type GetDayInput,
  type RemoveWorkTypeInput,
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
  workDayTypeFieldsSchema,
  type RestoreSlotInput,
  type SlotFormInput,
  type TemplatePatchInput,
  type WorkDayTypeFieldsInput,
} from "./template";

export {
  completeFirstRunInput,
  updatePreferencesInput,
  type CompleteFirstRunInput,
  type UpdatePreferencesInput,
} from "./user";

export {
  applyChangesInput,
  applyTemplateInput,
  applyPlanInput,
  assignBlocksInput,
  blockAssignmentSchema,
  changeAnchorInput,
  copyWeekInput,
  dayDateInput,
  defaultPlanInput,
  oneOffFormSchema,
  prefillWeekInput,
  removeOneOffInput,
  tradeWorkoutsInput,
  weekInput,
  type AssignBlocksInput,
  type BlockAssignmentInput,
  type OneOffFormInput,
  type TradeWorkoutsInput,
} from "./week";

export {
  confirmDayInput,
  quickPickInput,
  type ConfirmDayInput,
} from "./confirm";

export {
  workflowBoardInput,
  workflowColumnRemoveInput,
  workflowColumnRoleSchema,
  workflowColumnSaveInput,
  workflowColumnSetRoleInput,
  workflowGroupCreateInput,
  workflowGroupRenameInput,
  workflowGroupSetCollapsedInput,
  workflowGroupSetHueInput,
  workflowIdInput,
  workflowListClosedInput,
  workflowReorderInput,
  workflowTaskCreateInput,
  workflowTaskMoveInput,
  workflowTaskRestoreInput,
  workflowTaskSetFiringInput,
  workflowTaskUpdateInput,
  workflowTemplateIdInput,
  workflowTemplateRenameInput,
  workflowTemplateSaveInput,
  workflowViewCreateInput,
  workflowViewRenameInput,
  type WorkflowBoardInput,
  type WorkflowColumnRemoveInput,
  type WorkflowColumnSaveInput,
  type WorkflowColumnSetRoleInput,
  type WorkflowGroupCreateInput,
  type WorkflowGroupRenameInput,
  type WorkflowGroupSetCollapsedInput,
  type WorkflowGroupSetHueInput,
  type WorkflowIdInput,
  type WorkflowListClosedInput,
  type WorkflowReorderInput,
  type WorkflowTaskCreateInput,
  type WorkflowTaskMoveInput,
  type WorkflowTaskRestoreInput,
  type WorkflowTaskSetFiringInput,
  type WorkflowTaskUpdateInput,
  type WorkflowTemplateIdInput,
  type WorkflowTemplateRenameInput,
  type WorkflowTemplateSaveInput,
  type WorkflowViewCreateInput,
  type WorkflowViewRenameInput,
} from "./workflow";

export {
  addFromLibraryInput,
  chooseFromPoolInput,
  adjustApplyInput,
  adjustEntrySchema,
  adjustHowSchema,
  adjustPreviewInput,
  adjustScopeInput,
  adjustWhatSchema,
  doNowInput,
  habitDayEditInput,
  moveBlockInput,
  moveItemInput,
  previewFitInput,
  type AdjustApplyInput,
  type AdjustPreviewInput,
  type DoNowInput,
  type HabitDayEditInput,
  type MoveBlockInput,
  type MoveItemInput,
  type PreviewFitInput,
} from "./adjust";
