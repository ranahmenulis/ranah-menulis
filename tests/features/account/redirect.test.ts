import { describe, expect, it } from "vitest";
import { internalPath, safeNext, withNext } from "@/features/account/redirect";

describe("safeNext", () => {
  it("keeps a path inside the app, with its query and hash", () => {
    expect(safeNext("/projects/lomba-x?kategori=lomba#syarat")).toBe(
      "/projects/lomba-x?kategori=lomba#syarat",
    );
    expect(safeNext("/postingan/abc")).toBe("/postingan/abc");
  });

  it("falls back to the home screen when nothing usable came", () => {
    expect(safeNext(null)).toBe("/beranda");
    expect(safeNext("")).toBe("/beranda");
    expect(safeNext("beranda")).toBe("/beranda");
  });

  it.each([
    "https://jahat.example/",
    "//jahat.example/",
    "/\\jahat.example",
    "javascript:alert(1)",
    "/ok\nLocation: x",
    "/masuk",
    "/daftar?lanjut=/x",
    "/verifikasi",
    "/masuk/",
    "/daftar//?lanjut=%2Fx",
    "/mulai",
  ])("refuses %j", (raw) => {
    expect(safeNext(raw)).toBe("/beranda");
  });

  it("uses the fallback it is given", () => {
    expect(safeNext("//x", "")).toBe("");
  });
});

describe("withNext", () => {
  it("adds the destination as a query value", () => {
    expect(withNext("/masuk", "/projects/x")).toBe("/masuk?lanjut=%2Fprojects%2Fx");
  });

  it("adds nothing for a missing or unsafe destination", () => {
    expect(withNext("/masuk", null)).toBe("/masuk");
    expect(withNext("/masuk", "//jahat.example")).toBe("/masuk");
    expect(withNext("/masuk", "/masuk")).toBe("/masuk");
  });

  it("appends extra values after it", () => {
    expect(withNext("/verifikasi", "/studio", { status: "berhasil" })).toBe(
      "/verifikasi?lanjut=%2Fstudio&status=berhasil",
    );
    expect(withNext("/verifikasi", null, { status: "berhasil" })).toBe(
      "/verifikasi?status=berhasil",
    );
  });
});

describe("internalPath", () => {
  it("allows any path inside the app, account screens included", () => {
    expect(internalPath("/verifikasi?status=berhasil", "/x")).toBe("/verifikasi?status=berhasil");
    expect(internalPath("/atur-ulang-sandi", "/x")).toBe("/atur-ulang-sandi");
  });

  it("falls back for anything that could leave the app", () => {
    for (const bad of [null, undefined, "", "jahat", "//jahat.example", "/\\jahat", "/a\nb"]) {
      expect(internalPath(bad, "/x")).toBe("/x");
    }
  });
});
