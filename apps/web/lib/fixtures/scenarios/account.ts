import type { InstallOverride } from "@/lib/pwa/use-install-state";
import { BASE_NOW, baseRecords } from "./base-day";
import type { Scenario } from "./index";

/**
 * The avatar menu's and the Install sheet's scenarios (USE-83). Each stands
 * the install check on a device, since a capture cannot be taken from a
 * home screen; `account-*` open the menu on load, `install-*`
 * are taken with `&sheet=install`.
 */

const PHONE_BROWSER: InstallOverride = {
  standalone: false,
  phone: true,
  platform: "iphone",
  notSafari: false,
  prompt: false,
};

const INSTALLED: InstallOverride = { ...PHONE_BROWSER, standalone: true };

function accountScenario(
  name: string,
  install: InstallOverride,
  options: { menuOpen?: boolean; noPhoto?: boolean } = {},
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
};
