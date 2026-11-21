import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { AccountProfile } from "@/features/account/account-store";
import { SettingsHead } from "@/features/account/components/settings/settings-head";
import { useProfileForm } from "@/features/account/hooks/use-profile-form";

afterEach(cleanup);

const saved: AccountProfile = {
  name: "Rani Puspita",
  username: "rani",
  bio: "",
  country: "ID",
  timeZone: "Asia/Jakarta",
  genres: [],
  avatar: null,
};

function Harness({ profile = saved }: { profile?: AccountProfile }) {
  const form = useProfileForm(profile, profile.username);
  return <SettingsHead profile={profile} form={form} />;
}

describe("SettingsHead", () => {
  it("shows the saved name and username without adding a heading", () => {
    render(<Harness />);
    expect(screen.getByText("Rani Puspita").tagName).toBe("P");
    expect(screen.getByText("@rani")).toBeTruthy();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("carries the photo controls, so there is one avatar on the page", () => {
    const { container } = render(<Harness />);
    expect(screen.getByRole("button", { name: "Tambah foto" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Hapus foto" })).toBeNull();
    expect(screen.getByLabelText("Foto profil", { selector: "input" })).toBeTruthy();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("previews the form's photo, and removing it shows the initials again", () => {
    const src = "data:image/webp;base64,AAAA";
    const { container } = render(<Harness profile={{ ...saved, avatar: src }} />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(src);
    act(() => screen.getByRole("button", { name: "Hapus foto" }).click());
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("button", { name: "Tambah foto" })).toBeTruthy();
  });

  it("leaves the username line out when there is none", () => {
    render(<Harness profile={{ ...saved, username: "" }} />);
    expect(screen.queryByText(/^@/)).toBeNull();
  });
});
