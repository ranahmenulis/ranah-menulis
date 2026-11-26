import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const state = vi.hoisted(() => ({
  userId: "user-1" as string | null,
  reg: null as null | Record<string, unknown>,
  project: null as null | Record<string, unknown>,
  updated: [] as unknown[],
  fetchCalls: [] as { url: string; body: Record<string, unknown> }[],
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getClaims: async () => ({
        data: state.userId ? { claims: { sub: state.userId } } : null,
      }),
    },
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "projects") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: state.project, error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: state.reg, error: null }),
            }),
          }),
        }),
        update: (payload: unknown) => ({
          eq: async () => {
            state.updated.push(payload);
            return { error: null };
          },
        }),
      };
    },
  }),
}));

import { POST } from "@/app/api/payments/qris/route";

function postReq(
  body: Record<string, unknown>,
  headers: Record<string, string> = {
    "content-type": "application/json",
    origin: "https://ranah-menulis.vercel.app",
  },
) {
  return new Request("https://ranah-menulis.vercel.app/api/payments/qris", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/payments/qris", () => {
  beforeEach(() => {
    process.env.PAYMENTGT_BASE_URL = "https://pay.example.com";
    process.env.PAYMENTGT_API_TOKEN = "tok";
    process.env.PAYMENTGT_WEBHOOK_SECRET = "sec";
    state.userId = "user-1";
    state.project = null;
    state.reg = {
      id: "reg-1",
      slug: "lomba-cerpen-hujan-2026",
      user_id: "user-1",
      status: "menunggu-pembayaran",
      package_name: null,
      registered_at: new Date().toISOString(),
      amount_idr: null,
      unique_amount: null,
      paymentgt_id: null,
      qris_string: null,
      qris_expires_at: null,
    };
    state.updated.length = 0;
    state.fetchCalls.length = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        const parsed = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
        state.fetchCalls.push({ url: String(url), body: parsed });
        return new Response(
          JSON.stringify({
            success: true,
            payment_id: "pg-1",
            unique_amount: Number(parsed.amount) + 123,
            qris_string: "000201...",
            expires_at: new Date(Date.now() + 3600_000).toISOString(),
          }),
          { status: 200 },
        );
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMENTGT_BASE_URL;
    delete process.env.PAYMENTGT_API_TOKEN;
    delete process.env.PAYMENTGT_WEBHOOK_SECRET;
  });

  it("rejects cross-origin CSRF POST requests with 403", async () => {
    const res = await POST(
      postReq(
        { slug: "lomba-cerpen-hujan-2026" },
        { "content-type": "application/json", origin: "https://evil.example" },
      ),
    );
    expect(res.status).toBe(403);
    expect(state.fetchCalls).toHaveLength(0);
  });

  it("rejects unauthenticated callers with 401", async () => {
    state.userId = null;
    const res = await POST(postReq({ slug: "lomba-cerpen-hujan-2026" }));
    expect(res.status).toBe(401);
  });

  it("ignores client amountIdr tampering and bills the official server price", async () => {
    // Official price of lomba-cerpen-hujan-2026 in fixtures is Rp 35.000; client tries Rp 1.000.
    const res = await POST(postReq({ slug: "lomba-cerpen-hujan-2026", amountIdr: 1000 }));
    expect(res.status).toBe(200);
    expect(state.fetchCalls).toHaveLength(1);
    expect(state.fetchCalls[0].body.amount).toBe(35_000);
    expect(state.updated[0]).toMatchObject({ amount_idr: 35_000, unique_amount: 35_123 });
  });

  it("resolves Solo package price on the server from DB project definition", async () => {
    state.project = {
      category: "solo",
      publication: "terbit",
      fee: {},
      block: {
        kind: "solo",
        packages: [{ name: "Terbit", fee: { idr: 1_500_000 } }],
      },
    };
    state.reg = {
      ...state.reg!,
      slug: "solo-custom",
      package_name: "Terbit",
    };

    const res = await POST(postReq({ slug: "solo-custom", amountIdr: 500 }));
    expect(res.status).toBe(200);
    expect(state.fetchCalls[0].body.amount).toBe(1_500_000);
  });

  it("refuses free projects with 400", async () => {
    state.reg = { ...state.reg!, slug: "lomba-esai-literasi-remaja" };
    const res = await POST(postReq({ slug: "lomba-esai-literasi-remaja", amountIdr: 10_000 }));
    expect(res.status).toBe(400);
    expect(state.fetchCalls).toHaveLength(0);
  });
});
