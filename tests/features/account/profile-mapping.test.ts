import { describe, expect, it } from "vitest";
import {
  accountToUpdate,
  avatarUrl,
  emptyAccount,
  rowToAccount,
  type ProfileRow,
} from "@/features/account/profile-mapping";

const row: ProfileRow = {
  id: "11111111-1111-1111-1111-111111111111",
  username: "laras",
  display_name: "Laras Wati",
  bio: "Menulis cerpen.",
  avatar_path: "11111111-1111-1111-1111-111111111111/avatar.webp",
  country: "MY",
  timezone: "Asia/Kuala_Lumpur",
  genres: ["Cerpen", "Bukan genre"],
  prefs: { showStreak: true, writing: { mode: "typewriter" } },
  onboarded_at: null,
  created_at: "2026-11-20T00:00:00.000Z",
  updated_at: "2026-11-25T00:00:00.000Z",
};
const context = { email: "laras@contoh.id", supabaseUrl: "https://x.supabase.co" };

describe("rowToAccount", () => {
  it("builds an account that starts from an empty world", () => {
    const account = rowToAccount(row, context);
    expect(account.registered).toBe(true);
    expect(account.email).toBe("laras@contoh.id");
    expect(account.memberSince).toBe("2026-11-20T00:00:00.000Z");
    expect(account.profile).toMatchObject({
      name: "Laras Wati",
      username: "laras",
      bio: "Menulis cerpen.",
      country: "MY",
      timeZone: "Asia/Kuala_Lumpur",
    });
  });

  it("keeps only known genres and reads the saved preferences", () => {
    const account = rowToAccount(row, context);
    expect(account.profile.genres).toEqual(["Cerpen"]);
    expect(account.prefs.showStreak).toBe(true);
    expect(account.prefs.writing.mode).toBe("typewriter");
  });

  it("points the photo at the public storage address, versioned by the profile time", () => {
    const account = rowToAccount(row, context);
    expect(account.profile.avatar).toBe(
      `https://x.supabase.co/storage/v1/object/public/avatars/${row.avatar_path}?v=${Date.parse(row.updated_at)}`,
    );
  });

  it("falls back field by field when stored values are broken or missing", () => {
    const account = rowToAccount(
      { ...row, prefs: "oops", timezone: "Nowhere/Land", country: "XX", avatar_path: null },
      context,
    );
    expect(account.profile.avatar).toBeNull();
    expect(account.profile.country).toBe("ID");
    expect(account.profile.timeZone).not.toBe("Nowhere/Land");
    expect(account.prefs.showStreak).toBe(false);
  });

  it("shows empty text for a profile that has no name yet", () => {
    const account = rowToAccount(
      { ...row, display_name: null, username: null, bio: null },
      context,
    );
    expect(account.profile).toMatchObject({ name: "", username: "", bio: "" });
  });
});

describe("emptyAccount", () => {
  it("is an empty registered account with the email", () => {
    const account = emptyAccount("a@b.id");
    expect(account).toMatchObject({ email: "a@b.id", registered: true });
    expect(account.profile.name).toBe("");
  });
});

describe("accountToUpdate", () => {
  it("writes trimmed text, empty text as null, and the preferences as plain data", () => {
    const account = rowToAccount(row, context);
    const update = accountToUpdate({
      ...account,
      profile: { ...account.profile, name: "  Laras  ", bio: "   ", username: "" },
    });
    expect(update).toMatchObject({
      display_name: "Laras",
      bio: null,
      username: null,
      country: "MY",
      timezone: "Asia/Kuala_Lumpur",
      genres: ["Cerpen"],
    });
    expect(update.prefs).toMatchObject({ showStreak: true });
    expect(update).not.toHaveProperty("avatar_path");
  });
});

describe("avatarUrl", () => {
  it("is null without a base address or a path", () => {
    expect(avatarUrl(null, "a/b.webp", row.updated_at)).toBeNull();
    expect(avatarUrl("https://x.co", null, row.updated_at)).toBeNull();
  });
});
