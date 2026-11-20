import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetAccount, saveAccount } from "@/features/account/account-store";
import { AuthorAvatar } from "@/features/community/components/author-avatar";
import { ME_ID } from "@/features/community/fixtures/authors";

const PHOTO = "data:image/webp;base64,AAAA";

beforeEach(() => {
  window.localStorage.clear();
  resetAccount();
  saveAccount({ profile: { avatar: PHOTO } });
});
afterEach(cleanup);

describe("AuthorAvatar", () => {
  it("shows your own photo on your own entries", () => {
    render(<AuthorAvatar author={{ id: ME_ID, name: "Rinjani Putri" }} />);
    expect(screen.getByRole("img", { name: "Rinjani Putri" }).getAttribute("src")).toBe(PHOTO);
  });

  it("keeps initials for every other author", () => {
    render(<AuthorAvatar author={{ id: "nur-aisyah", name: "Nur Aisyah" }} />);
    const avatar = screen.getByRole("img", { name: "Nur Aisyah" });
    expect(avatar.getAttribute("src")).toBeNull();
    expect(avatar.textContent).toBe("NA");
  });
});
