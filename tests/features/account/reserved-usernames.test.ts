import { describe, expect, it } from "vitest";
import { usernameTaken } from "@/features/account/reserved-usernames";

describe("reserved usernames", () => {
  it("treats the Community authors' usernames as taken, except your own", () => {
    expect(usernameTaken("hafizrahman")).toBe(true);
    expect(usernameTaken("namabaru")).toBe(false);
    expect(usernameTaken("rinjaniputri", "rinjaniputri")).toBe(false);
    expect(usernameTaken("rinjaniputri")).toBe(true);
  });
});
