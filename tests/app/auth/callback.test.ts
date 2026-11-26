import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  profile: { onboarded_at: "2026-11-26T00:00:00Z" } as { onboarded_at: string | null } | null,
  fail: false,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => {
    if (supabase.fail) throw new Error("boom");
    return {
      auth: { exchangeCodeForSession: supabase.exchangeCodeForSession },
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: supabase.profile }) }) }),
      }),
    };
  },
}));

import { GET } from "@/app/auth/callback/route";

const call = (query: string) => GET(new NextRequest(`https://ranah.test/auth/callback${query}`));
const where = (response: Response) => response.headers.get("location");

beforeEach(() => {
  supabase.exchangeCodeForSession.mockReset();
  supabase.exchangeCodeForSession.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  supabase.profile = { onboarded_at: "2026-11-26T00:00:00Z" };
  supabase.fail = false;
});

describe("GET /auth/callback", () => {
  it("swaps the code for a session and goes to next", async () => {
    const response = await call("?code=abc&next=/verifikasi%3Fstatus%3Dberhasil&fail=/masuk");
    expect(supabase.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(where(response)).toBe("https://ranah.test/verifikasi?status=berhasil");
  });

  it("goes to the home screen when no destination was given", async () => {
    expect(where(await call("?code=abc"))).toBe("https://ranah.test/beranda");
  });

  it("goes to fail when the link has no code (expired, or the address answered with a fragment)", async () => {
    const response = await call("?next=/mulai&fail=/verifikasi%3Fstatus%3Dkedaluwarsa");
    expect(supabase.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(where(response)).toBe("https://ranah.test/verifikasi?status=kedaluwarsa");
  });

  it("goes to fail when the code is refused (another browser, used twice)", async () => {
    supabase.exchangeCodeForSession.mockResolvedValue({ error: { message: "bad" } });
    const response = await call(
      "?code=abc&next=/mulai&fail=/atur-ulang-sandi%3Fstatus%3Dkedaluwarsa",
    );
    expect(where(response)).toBe("https://ranah.test/atur-ulang-sandi?status=kedaluwarsa");
  });

  it("goes to fail when the server cannot be reached", async () => {
    supabase.fail = true;
    expect(where(await call("?code=abc&next=/mulai&fail=/masuk"))).toBe("https://ranah.test/masuk");
  });

  it.each(["https://jahat.example", "//jahat.example", "/\\jahat.example", "jahat", "/a\nb"])(
    "never leaves the app: %j",
    async (bad) => {
      const target = encodeURIComponent(bad);
      const ok = await call(`?code=abc&next=${target}&fail=${target}`);
      expect(where(ok)).toBe("https://ranah.test/beranda");
      const refused = await call(`?next=${target}&fail=${target}`);
      expect(where(refused)).toBe("https://ranah.test/masuk");
    },
  );

  it("sends first-time OAuth users to Mulai while keeping their destination", async () => {
    supabase.profile = { onboarded_at: null };
    expect(where(await call("?code=abc&next=/studio&onboarding=1"))).toBe(
      "https://ranah.test/mulai?lanjut=%2Fstudio",
    );
    expect(where(await call("?code=abc&onboarding=1"))).toBe("https://ranah.test/mulai");
  });

  it("sends already onboarded OAuth users straight to next", async () => {
    supabase.profile = { onboarded_at: "2026-11-26T00:00:00Z" };
    expect(where(await call("?code=abc&next=/studio&onboarding=1"))).toBe(
      "https://ranah.test/studio",
    );
  });
});
