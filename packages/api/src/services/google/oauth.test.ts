import { describe, expect, it } from "vitest";
import {
  buildGoogleAuthorizeUrl,
  createGoogleAuthorization,
  GOOGLE_AUTHORIZE_URL,
} from "./oauth";

/** USE-103 C1: the authorize URL asks for the read-only pair and nothing more. */

describe("Google's authorize URL (C-USE-103-1)", () => {
  const { state, challenge } = createGoogleAuthorization();
  const url = new URL(
    buildGoogleAuthorizeUrl({
      clientId: "calendar-client.apps.googleusercontent.com",
      redirectUri: "https://synapse.example/api/integrations/google/callback",
      state,
      challenge,
    }),
  );
  const params = url.searchParams;

  it("goes to Google's v2 endpoint", () => {
    expect(`${url.origin}${url.pathname}`).toBe(GOOGLE_AUTHORIZE_URL);
  });

  it("carries exactly the two read-only scopes, space-delimited", () => {
    expect(params.get("scope")?.split(" ")).toEqual([
      "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
      "https://www.googleapis.com/auth/calendar.events.readonly",
    ]);
  });

  it("asks offline, with consent and the account picker", () => {
    expect(params.get("access_type")).toBe("offline");
    expect(params.get("prompt")).toBe("consent select_account");
    expect(params.get("response_type")).toBe("code");
  });

  it("carries the state and an S256 code challenge", () => {
    expect(params.get("state")).toBe(state);
    expect(params.get("code_challenge")).toBe(challenge);
    expect(params.get("code_challenge_method")).toBe("S256");
    expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("never widens the grant", () => {
    expect(params.has("include_granted_scopes")).toBe(false);
    expect(params.get("scope")).not.toMatch(
      /auth\/calendar(\s|$|\.readonly(\s|$))/,
    );
    expect([...params.keys()].sort()).toEqual(
      [
        "access_type",
        "client_id",
        "code_challenge",
        "code_challenge_method",
        "prompt",
        "redirect_uri",
        "response_type",
        "scope",
        "state",
      ].sort(),
    );
  });
});
