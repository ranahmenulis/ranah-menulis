import { describe, expect, it } from "vitest";
import {
  activeId,
  bottomNav,
  isPostPage,
  kelolaNav,
  mainNav,
  mobileTitle,
  showsWriteButton,
} from "@/features/app-shell/nav";

describe("navigation", () => {
  it("lights Studio for every Studio tab, Streak included", () => {
    expect(activeId("/studio")).toBe("studio");
    expect(activeId("/studio/streak")).toBe("studio");
    expect(activeId("/beranda")).toBe("beranda");
    expect(activeId("/")).toBeNull();
  });

  it("uses the Studio title for both Studio tabs on phones, and none on Beranda", () => {
    expect(mobileTitle("/studio")).toBe("Studio");
    expect(mobileTitle("/studio/streak")).toBe("Studio");
    expect(mobileTitle("/beranda")).toBeNull();
  });

  it("opens Projects from the navigation, for the catalog and for each project", () => {
    expect(mainNav.find((n) => n.id === "projects")?.href).toBe("/projects");
    expect(bottomNav.find((n) => n.id === "projects")?.href).toBe("/projects");
    expect(activeId("/projects")).toBe("projects");
    expect(activeId("/projects/lomba-cerpen-hujan-2026")).toBe("projects");
    expect(mobileTitle("/projects")).toBe("Projects");
  });

  it("shows the write button on Beranda and the document list, not on Streak", () => {
    expect(showsWriteButton("/beranda")).toBe(true);
    expect(showsWriteButton("/studio")).toBe(true);
    expect(showsWriteButton("/studio/streak")).toBe(false);
  });

  it("lists Jelajahi under Beranda on wide screens and as a phone tab", () => {
    expect(mainNav.map((n) => n.id).slice(0, 3)).toEqual(["beranda", "jelajahi", "studio"]);
    expect(bottomNav.some((n) => n.id === "jelajahi")).toBe(true);
    expect(activeId("/jelajahi")).toBe("jelajahi");
  });

  it("gives Tersimpan and Notifikasi their own destinations", () => {
    expect(mainNav.find((n) => n.id === "tersimpan")?.href).toBe("/tersimpan");
    expect(activeId("/tersimpan")).toBe("tersimpan");
    expect(activeId("/notifikasi")).toBe("notifikasi");
  });

  it("opens your own profile from Profil, and only that page counts as Profil", () => {
    expect(mainNav.find((n) => n.id === "profil")?.href).toBe("/penulis/rinjaniputri");
    expect(bottomNav.find((n) => n.id === "profil")?.href).toBe("/penulis/rinjaniputri");
    expect(activeId("/penulis/rinjaniputri")).toBe("profil");
    expect(activeId("/penulis/hafizrahman")).toBeNull();
  });

  it("recognises post pages, which replace the phone bottom bar", () => {
    expect(isPostPage("/postingan/hujan-pertama-bulan-november")).toBe(true);
    expect(isPostPage("/jelajahi")).toBe(false);
  });

  it("has five phone tabs, Jelajahi included, and no Streak anywhere (it is a Studio tab)", () => {
    expect(bottomNav.map((n) => n.id)).toEqual([
      "beranda",
      "jelajahi",
      "studio",
      "projects",
      "profil",
    ]);
    expect(mainNav.some((n) => n.id === "streak")).toBe(false);
  });

  it("keeps Kelola out of the default lists; it is added only for people who hold a role", () => {
    expect(mainNav.some((n) => n.id === "kelola")).toBe(false);
    expect(bottomNav.some((n) => n.id === "kelola")).toBe(false);
    expect(kelolaNav.href).toBe("/kelola");
    expect(activeId("/kelola")).toBe("kelola");
    expect(activeId("/kelola/editor")).toBe("kelola");
  });
});
