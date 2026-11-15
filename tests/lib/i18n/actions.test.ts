import { beforeEach, describe, expect, it, vi } from "vitest";

const set = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({ set }) }));

import { setLocale } from "@/lib/i18n/actions";

beforeEach(() => set.mockClear());

describe("setLocale", () => {
  it("stores a supported locale in a long-lived lax cookie", async () => {
    await setLocale("en");
    expect(set).toHaveBeenCalledWith(
      "locale",
      "en",
      expect.objectContaining({ path: "/", sameSite: "lax", maxAge: 31536000 }),
    );
  });

  it("ignores values outside the allowlist", async () => {
    await setLocale("fr");
    await setLocale("<script>");
    expect(set).not.toHaveBeenCalled();
  });
});
