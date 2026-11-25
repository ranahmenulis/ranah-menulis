import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AccountGateway } from "@/features/account/account-gateway";
import { AuthProvider } from "@/features/account/account-session";
import {
  readAccount,
  saveAccount,
  saveAccountAsync,
  useAccount,
} from "@/features/account/account-store";
import { emptyAccount } from "@/features/account/profile-mapping";
import type { SessionSnapshot } from "@/features/account/session-types";
import { GUEST_SESSION } from "@/lib/auth/session-context";
import { useViewer } from "@/lib/viewer";

afterEach(cleanup);

function userSnapshot(name: string): SessionSnapshot {
  const account = emptyAccount("laras@contoh.id");
  return {
    session: { status: "user", userId: "u1", platformRoles: [] },
    account: { ...account, profile: { ...account.profile, name } },
  };
}

function Probe() {
  const account = useAccount();
  const viewer = useViewer();
  return (
    <p>
      {viewer}:{account.profile.name}
    </p>
  );
}

function gateway(result: boolean): AccountGateway & { updateProfile: ReturnType<typeof vi.fn> } {
  return { updateProfile: vi.fn(async () => result) };
}

describe("AuthProvider", () => {
  it("shows the signed-in account and the signed-in view from the server snapshot", () => {
    render(
      <AuthProvider snapshot={userSnapshot("Laras")} gateway={gateway(true)}>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByText("masuk:Laras")).toBeTruthy();
  });

  it("shows the signed-out view for a visitor", () => {
    render(
      <AuthProvider snapshot={{ session: GUEST_SESSION, account: null }} gateway={gateway(true)}>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByText(/^tamu:/)).toBeTruthy();
  });

  it("updates the screen at once and writes the profile row", async () => {
    const api = gateway(true);
    render(
      <AuthProvider snapshot={userSnapshot("Laras")} gateway={api}>
        <Probe />
      </AuthProvider>,
    );
    let kept = false;
    await act(async () => {
      kept = await saveAccountAsync({ profile: { name: "Laras Wati" } });
    });
    expect(kept).toBe(true);
    expect(screen.getByText("masuk:Laras Wati")).toBeTruthy();
    expect(api.updateProfile).toHaveBeenCalledTimes(1);
    expect(api.updateProfile.mock.calls[0]?.[0]).toBe("u1");
    expect(api.updateProfile.mock.calls[0]?.[1]).toMatchObject({ display_name: "Laras Wati" });
    expect(readAccount().profile.name).toBe("Laras Wati");
  });

  it("puts the old values back when the write is refused", async () => {
    render(
      <AuthProvider snapshot={userSnapshot("Laras")} gateway={gateway(false)}>
        <Probe />
      </AuthProvider>,
    );
    let kept = true;
    await act(async () => {
      kept = await saveAccountAsync({ profile: { name: "Baru" } });
    });
    expect(kept).toBe(false);
    expect(screen.getByText("masuk:Laras")).toBeTruthy();
    expect(readAccount().profile.name).toBe("Laras");
  });

  it("does not write the profile for changes that are not in it", async () => {
    const api = gateway(true);
    render(
      <AuthProvider snapshot={userSnapshot("Laras")} gateway={api}>
        <Probe />
      </AuthProvider>,
    );
    await act(async () => {
      await saveAccountAsync({ passwordChangedAt: "2026-11-25T00:00:00.000Z" });
    });
    expect(api.updateProfile).not.toHaveBeenCalled();
    expect(readAccount().passwordChangedAt).toBe("2026-11-25T00:00:00.000Z");
  });

  it("lets the synchronous save start the same write", async () => {
    const api = gateway(true);
    render(
      <AuthProvider snapshot={userSnapshot("Laras")} gateway={api}>
        <Probe />
      </AuthProvider>,
    );
    await act(async () => {
      expect(saveAccount({ profile: { bio: "Bio baru" } })).toBe(true);
    });
    expect(api.updateProfile).toHaveBeenCalledTimes(1);
    expect(readAccount().profile.bio).toBe("Bio baru");
  });

  it("takes a fresh server read in place of what it held", () => {
    const api = gateway(true);
    const { rerender } = render(
      <AuthProvider snapshot={userSnapshot("Laras")} gateway={api}>
        <Probe />
      </AuthProvider>,
    );
    rerender(
      <AuthProvider snapshot={userSnapshot("Dewi")} gateway={api}>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByText("masuk:Dewi")).toBeTruthy();
  });

  it("goes back to the device account once it unmounts", () => {
    const { unmount } = render(
      <AuthProvider snapshot={userSnapshot("Laras")} gateway={gateway(true)}>
        <Probe />
      </AuthProvider>,
    );
    expect(readAccount().profile.name).toBe("Laras");
    unmount();
    expect(readAccount().profile.name).not.toBe("Laras");
  });
});
