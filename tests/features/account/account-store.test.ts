import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_ACCOUNT,
  mergeAccount,
  parseAccount,
  resetAccount,
  saveAccount,
} from "@/features/account/account-store";

beforeEach(() => localStorage.clear());
afterEach(() => resetAccount());

describe("parseAccount", () => {
  it("is the dummy reader when nothing is stored or the value is broken", () => {
    expect(parseAccount(null)).toBe(DEFAULT_ACCOUNT);
    expect(parseAccount("{nope")).toBe(DEFAULT_ACCOUNT);
    expect(parseAccount("[]")).toBe(DEFAULT_ACCOUNT);
    expect(parseAccount("7")).toBe(DEFAULT_ACCOUNT);
  });

  it("falls back field by field, so one bad field does not lose the rest", () => {
    const account = parseAccount(
      JSON.stringify({
        email: 42,
        profile: {
          name: "Laras",
          country: "XX",
          timeZone: "Mars/Olympus",
          genres: ["Puisi", "Sihir"],
          avatar: "http://tidak-aman.example/x.png",
        },
        prefs: { showStreak: "ya" },
      }),
    );
    expect(account.email).toBe(DEFAULT_ACCOUNT.email);
    expect(account.profile.name).toBe("Laras");
    expect(account.profile.country).toBe("ID");
    expect(account.profile.timeZone).toBe(DEFAULT_ACCOUNT.profile.timeZone);
    expect(account.profile.genres).toEqual(["Puisi"]);
    expect(account.profile.avatar).toBeNull();
    expect(account.prefs.showStreak).toBe(false);
  });

  it("keeps a photo that is an image data URL", () => {
    const avatar = "data:image/jpeg;base64,AAAA";
    expect(parseAccount(JSON.stringify({ profile: { avatar } })).profile.avatar).toBe(avatar);
  });
});

describe("mergeAccount", () => {
  it("changes only what the patch names", () => {
    const next = mergeAccount(DEFAULT_ACCOUNT, {
      profile: { bio: "Baru" },
      prefs: { emailComments: false },
    });
    expect(next.profile.bio).toBe("Baru");
    expect(next.profile.name).toBe(DEFAULT_ACCOUNT.profile.name);
    expect(next.prefs.emailComments).toBe(false);
    expect(next.prefs.emailProjects).toBe(true);
  });

  it("can set the password date back to null", () => {
    const changed = mergeAccount(DEFAULT_ACCOUNT, { passwordChangedAt: "2026-11-16T00:00:00Z" });
    expect(mergeAccount(changed, { passwordChangedAt: null }).passwordChangedAt).toBeNull();
    expect(mergeAccount(changed, {}).passwordChangedAt).toBe("2026-11-16T00:00:00Z");
  });
});

describe("saveAccount and resetAccount", () => {
  it("keeps what was saved on top of the dummy reader", () => {
    expect(saveAccount({ profile: { name: "Laras" } })).toBe(true);
    const stored = parseAccount(localStorage.getItem("ranah.account"));
    expect(stored.profile.name).toBe("Laras");
    expect(stored.email).toBe(DEFAULT_ACCOUNT.email);
  });

  it("reports false when the browser refuses the write, and still remembers it for this tab", () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException("full", "QuotaExceededError");
    };
    try {
      expect(saveAccount({ profile: { name: "Dewi" } })).toBe(false);
    } finally {
      Storage.prototype.setItem = original;
    }
  });

  it("keeps showing the unsaved edit after a refused write, not the older stored value", () => {
    expect(saveAccount({ profile: { name: "Lama" } })).toBe(true);
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException("full", "QuotaExceededError");
    };
    try {
      expect(saveAccount({ profile: { name: "Baru" } })).toBe(false);
      // The next edit builds on the unsaved one instead of the stale stored value.
      expect(saveAccount({ profile: { bio: "Bio baru" } })).toBe(false);
    } finally {
      Storage.prototype.setItem = original;
    }
    const kept = parseAccount(localStorage.getItem("ranah.account"));
    expect(kept.profile.name).toBe("Lama");
    // A later successful write wins again and clears the in-memory copy.
    expect(saveAccount({ profile: { bio: "Tersimpan" } })).toBe(true);
    expect(parseAccount(localStorage.getItem("ranah.account")).profile.name).toBe("Baru");
  });

  it("goes back to the dummy reader on reset", () => {
    saveAccount({ profile: { name: "Laras" } });
    resetAccount();
    expect(localStorage.getItem("ranah.account")).toBeNull();
  });
});
