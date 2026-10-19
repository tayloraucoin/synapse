import type { InstallOverride } from "@/lib/pwa/use-install-state";
import { BASE_NOW, baseRecords } from "./base-day";
import type { ProfileSheetStart, Scenario } from "./index";

/**
 * The avatar menu's and the Install sheet's scenarios (USE-83). Each stands
 * the install check on a device, since a capture cannot be taken from a
 * home screen; `account-*` open the menu on load, `install-*`
 * are taken with `&sheet=install` and `profile-*` with `&sheet=profile`
 * (USE-84).
 */

const PHONE_BROWSER: InstallOverride = {
  standalone: false,
  phone: true,
  platform: "iphone",
  notSafari: false,
  prompt: false,
};

/**
 * A photo picked from the device for the crop and uploading captures, a drawn
 * [placeholder] in the board's cool tones; an SVG, so the crop is not tainted.
 */
const PICKED_PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 60 60"><defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="hsl(205 40% 32%)"/><stop offset="0.55" stop-color="hsl(110 25% 38%)"/><stop offset="1" stop-color="hsl(18 40% 34%)"/></linearGradient></defs><rect width="60" height="60" fill="url(#g)"/></svg>',
)}`;

const INSTALLED: InstallOverride = { ...PHONE_BROWSER, standalone: true };

function accountScenario(
  name: string,
  install: InstallOverride,
  options: {
    menuOpen?: boolean;
    noPhoto?: boolean;
    profileWrites?: Scenario["profileWrites"];
    profileSheet?: ProfileSheetStart;
  } = {},
): () => Scenario {
  return () => {
    const records = baseRecords();
    if (options.noPhoto) records.account.photoUrl = null;
    return {
      name,
      now: BASE_NOW,
      records,
      mode: "ready",
      install,
      accountMenuOpen: options.menuOpen ?? false,
      ...(options.profileWrites ? { profileWrites: options.profileWrites } : {}),
      ...(options.profileSheet ? { profileSheet: options.profileSheet } : {}),
    };
  };
}

export const ACCOUNT_SCENARIOS: Record<string, () => Scenario> = {
  "account-menu": accountScenario("account-menu", PHONE_BROWSER, {
    menuOpen: true,
  }),
  "account-installed": accountScenario("account-installed", INSTALLED, {
    menuOpen: true,
  }),
  "account-no-photo": accountScenario("account-no-photo", INSTALLED, {
    menuOpen: true,
    noPhoto: true,
  }),
  "install-iphone": accountScenario("install-iphone", PHONE_BROWSER),
  "install-android": accountScenario("install-android", {
    ...PHONE_BROWSER,
    platform: "android",
  }),
  "install-browser-prompt": accountScenario("install-browser-prompt", {
    ...PHONE_BROWSER,
    platform: "android",
    prompt: true,
  }),
  "install-other-browser": accountScenario("install-other-browser", {
    ...PHONE_BROWSER,
    notSafari: true,
  }),
  // ---- The Profile sheet (USE-84), with `&sheet=profile` ----
  profile: accountScenario("profile", INSTALLED),
  "profile-no-photo": accountScenario("profile-no-photo", INSTALLED, {
    noPhoto: true,
  }),
  "profile-crop": accountScenario("profile-crop", INSTALLED, {
    profileSheet: { step: "crop", photo: PICKED_PHOTO },
  }),
  "profile-uploading": accountScenario("profile-uploading", INSTALLED, {
    profileWrites: "hang",
    profileSheet: { step: "uploading", photo: PICKED_PHOTO },
  }),
  "profile-not-saved": accountScenario("profile-not-saved", INSTALLED, {
    profileWrites: "fail",
    profileSheet: { step: "not-saved", draftName: "Taylor A." },
  }),
};
