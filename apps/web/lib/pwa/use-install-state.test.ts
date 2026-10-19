import { describe, expect, it } from "vitest";
import {
  isInstallOffered,
  isOtherIosBrowser,
  type InstallState,
} from "./use-install-state";

const PHONE: InstallState = {
  known: true,
  standalone: false,
  phone: true,
  platform: "iphone",
  notSafari: false,
  prompt: null,
};

describe("C-USE-install-sheet-5: no way in once installed or at the desk", () => {
  it("offers Install the app in a phone browser, not installed, below the desk", () => {
    expect(isInstallOffered(PHONE, false)).toBe(true);
  });

  it("offers nothing installed", () => {
    expect(isInstallOffered({ ...PHONE, standalone: true }, false)).toBe(false);
  });

  it("offers nothing at the desk", () => {
    expect(isInstallOffered(PHONE, true)).toBe(false);
  });

  it("offers nothing off a phone", () => {
    expect(isInstallOffered({ ...PHONE, phone: false }, false)).toBe(false);
  });

  it("offers nothing before the device is read: the server renders no guess", () => {
    expect(isInstallOffered({ ...PHONE, known: false }, false)).toBe(false);
  });
});

describe("C-USE-install-sheet-other-browser-1: an iPhone browser not Safari", () => {
  const SAFARI =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

  it("reads Safari as Safari", () => {
    expect(isOtherIosBrowser(SAFARI)).toBe(false);
  });

  it.each([
    ["Chrome", "CriOS/129.0.6668.69"],
    ["Firefox", "FxiOS/131.0"],
    ["Edge", "EdgiOS/129.0"],
    ["Google's app", "GSA/339.0.686111475"],
    ["Instagram", "Instagram 350.0.0"],
  ])("reads %s as another browser", (_, token) => {
    expect(isOtherIosBrowser(`${SAFARI} ${token}`)).toBe(true);
  });
});
