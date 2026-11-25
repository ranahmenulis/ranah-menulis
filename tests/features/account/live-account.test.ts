import { describe, expect, it, vi } from "vitest";
import type { Account } from "@/features/account/account-model";
import type { AccountGateway } from "@/features/account/account-gateway";
import { createLiveAccount } from "@/features/account/live-account";
import { emptyAccount } from "@/features/account/profile-mapping";

const PHOTO = "data:image/webp;base64,AAAA";

function setup(result: "ok" | "username-taken" | "failed" = "ok", upload = true) {
  let screen: Account = {
    ...emptyAccount("laras@contoh.id"),
    profile: { ...emptyAccount("").profile, name: "Laras" },
  };
  const initial = screen;
  const gateway = {
    updateProfile: vi.fn<AccountGateway["updateProfile"]>(async () => result),
    uploadPhoto: vi.fn(async (userId: string) =>
      upload
        ? {
            ok: true as const,
            path: `${userId}/avatar.webp`,
            url: "https://x.supabase.co/p/avatar.webp",
          }
        : { ok: false as const },
    ),
    removePhoto: vi.fn(async () => {}),
  } satisfies AccountGateway;
  const live = createLiveAccount({
    userId: "u1",
    gateway,
    read: () => screen,
    write: (next) => {
      screen = next;
    },
  });
  return { live, gateway, initial, screen: () => screen };
}

describe("createLiveAccount.update", () => {
  it("shows the change at once and writes the changed columns", async () => {
    const { live, gateway, screen } = setup();
    expect(await live.update({ profile: { bio: "Bio baru" } })).toBe("ok");
    expect(screen().profile.bio).toBe("Bio baru");
    expect(gateway.updateProfile).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ bio: "Bio baru" }),
    );
  });

  it("puts the old values back and says why when the write is refused", async () => {
    const { live, initial, screen } = setup("username-taken");
    expect(await live.update({ profile: { username: "dipakai" } })).toBe("username-taken");
    expect(screen()).toBe(initial);
  });

  it("does not write when nothing in the profile row changed", async () => {
    const { live, gateway } = setup();
    expect(await live.update({ passwordChangedAt: "2026-11-25T00:00:00.000Z" })).toBe("ok");
    expect(gateway.updateProfile).not.toHaveBeenCalled();
  });
});

describe("createLiveAccount.saveProfile", () => {
  it("stores a new photo first, then writes the fields with its path", async () => {
    const { live, gateway, screen } = setup();
    const profile = { ...screen().profile, avatar: PHOTO };
    expect(await live.saveProfile(profile)).toBe("ok");
    expect(gateway.uploadPhoto).toHaveBeenCalledWith("u1", PHOTO);
    expect(gateway.updateProfile).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ avatar_path: "u1/avatar.webp" }),
    );
    expect(screen().profile.avatar).toMatch(/^https:\/\/x\.supabase\.co\/p\/avatar\.webp\?v=\d+$/);
  });

  it("writes nothing when the photo could not be stored", async () => {
    const { live, gateway, screen, initial } = setup("ok", false);
    expect(await live.saveProfile({ ...screen().profile, avatar: PHOTO, name: "Lain" })).toBe(
      "photo-failed",
    );
    expect(gateway.updateProfile).not.toHaveBeenCalled();
    expect(screen()).toBe(initial);
  });

  it("removes the stored photo and clears its path", async () => {
    const { live, gateway, screen } = setup();
    await live.saveProfile({ ...screen().profile, avatar: PHOTO });
    gateway.updateProfile.mockClear();
    expect(await live.saveProfile({ ...screen().profile, avatar: null })).toBe("ok");
    expect(gateway.removePhoto).toHaveBeenCalledWith("u1");
    expect(gateway.updateProfile).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ avatar_path: null }),
    );
    expect(screen().profile.avatar).toBeNull();
  });

  it("leaves the photo alone when it did not change", async () => {
    const { live, gateway, screen } = setup();
    await live.saveProfile({ ...screen().profile, bio: "Baru" });
    expect(gateway.uploadPhoto).not.toHaveBeenCalled();
    expect(gateway.removePhoto).not.toHaveBeenCalled();
    expect(gateway.updateProfile.mock.calls[0]?.[1]).not.toHaveProperty("avatar_path");
  });

  it("marks the profile finished only when asked", async () => {
    const { live, gateway, screen } = setup();
    await live.saveProfile(screen().profile);
    expect(gateway.updateProfile.mock.calls[0]?.[1]).not.toHaveProperty("onboarded_at");
    await live.saveProfile({ ...screen().profile, bio: "x" }, { finish: true });
    const written = gateway.updateProfile.mock.calls[1]?.[1] as { onboarded_at?: string };
    expect(Number.isNaN(Date.parse(written.onboarded_at ?? ""))).toBe(false);
  });

  it("reports a taken username and puts the previous profile back", async () => {
    const { live, screen, initial } = setup("username-taken");
    expect(await live.saveProfile({ ...screen().profile, username: "dipakai" })).toBe(
      "username-taken",
    );
    expect(screen()).toBe(initial);
  });
});
