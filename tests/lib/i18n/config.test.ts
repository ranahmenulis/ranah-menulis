import { describe, expect, it } from "vitest";
import { isLocale, resolveLocale } from "@/lib/i18n/config";

describe("resolveLocale", () => {
  it("prefers a valid cookie over Accept-Language", () => {
    expect(resolveLocale("en", "id-ID,id;q=0.9")).toBe("en");
  });

  it("ignores an invalid cookie and falls back to Accept-Language", () => {
    expect(resolveLocale("fr", "en-US,en;q=0.8")).toBe("en");
  });

  it("picks the supported language with the highest q, ignoring the region", () => {
    expect(resolveLocale(undefined, "ms;q=0.9,en-GB;q=0.8,id;q=0.7")).toBe("en");
    expect(resolveLocale(undefined, "en;q=0.5,id;q=0.9")).toBe("id");
  });

  it("falls back to Indonesian when nothing matches or the header is missing", () => {
    expect(resolveLocale(undefined, "fr-FR,de;q=0.8")).toBe("id");
    expect(resolveLocale(undefined, undefined)).toBe("id");
    expect(resolveLocale(null, "en;q=0")).toBe("id");
  });
});

describe("isLocale", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("id")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ms")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
