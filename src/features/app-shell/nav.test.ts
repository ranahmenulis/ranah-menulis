import { describe, expect, it } from "vitest";
import { activeId, bottomNav, mainNav, mobileTitle, showsWriteButton } from "./nav";

describe("navigation", () => {
  it("marks Streak and Studio as different entries by path", () => {
    expect(activeId("/studio")).toBe("studio");
    expect(activeId("/studio/streak")).toBe("streak");
    expect(activeId("/beranda")).toBe("beranda");
    expect(activeId("/")).toBeNull();
  });

  it("uses the Studio title for both Studio tabs on phones, and none on Beranda", () => {
    expect(mobileTitle("/studio")).toBe("Studio");
    expect(mobileTitle("/studio/streak")).toBe("Studio");
    expect(mobileTitle("/beranda")).toBeNull();
  });

  it("shows the write button on Beranda and the document list, not on Streak", () => {
    expect(showsWriteButton("/beranda")).toBe(true);
    expect(showsWriteButton("/studio")).toBe(true);
    expect(showsWriteButton("/studio/streak")).toBe(false);
  });

  it("has five phone tabs and no Streak in the desktop list (it is a sub-item)", () => {
    expect(bottomNav.map((n) => n.id)).toEqual([
      "beranda",
      "studio",
      "streak",
      "projects",
      "profil",
    ]);
    expect(mainNav.some((n) => n.id === "streak")).toBe(false);
  });
});
