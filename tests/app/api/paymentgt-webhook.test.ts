import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const db = vi.hoisted(() => ({
  reg: null as null | Record<string, unknown>,
  updates: [] as unknown[],
  events: [] as unknown[],
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "payment_events") {
        return {
          insert: async (payload: unknown) => {
            db.events.push(payload);
            return { error: null };
          },
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: db.reg, error: null }),
          }),
        }),
        update: (payload: unknown) => ({
          eq: () => ({
            eq: async () => {
              db.updates.push(payload);
              return { error: null };
            },
          }),
        }),
      };
    },
  }),
}));

import { POST } from "@/app/api/paymentgt/webhook/route";

function signedRequest(body: Record<string, unknown>, secret = "wh-secret") {
  const raw = JSON.stringify(body);
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = `v1=${createHmac("sha256", secret).update(`${ts}.${raw}`).digest("base64")}`;
  return new Request("https://ranah-menulis.vercel.app/api/paymentgt/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-paymentgt-timestamp": ts,
      "x-paymentgt-signature": sig,
    },
    body: raw,
  });
}

describe("POST /api/paymentgt/webhook", () => {
  beforeEach(() => {
    process.env.PAYMENTGT_BASE_URL = "https://pay.example.com";
    process.env.PAYMENTGT_API_TOKEN = "tok";
    process.env.PAYMENTGT_WEBHOOK_SECRET = "wh-secret";
    db.reg = {
      id: "reg-1",
      status: "menunggu-pembayaran",
      paymentgt_id: "pg-100",
      unique_amount: 50123,
      amount_idr: 50000,
    };
    db.updates.length = 0;
    db.events.length = 0;
  });

  afterEach(() => {
    delete process.env.PAYMENTGT_BASE_URL;
    delete process.env.PAYMENTGT_API_TOKEN;
    delete process.env.PAYMENTGT_WEBHOOK_SECRET;
  });

  it("rejects invalid signatures with 401", async () => {
    const res = await POST(signedRequest({ order_id: "reg-1" }, "wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("rejects mismatched payment_id or amount", async () => {
    const badId = await POST(
      signedRequest({
        order_id: "reg-1",
        event: "payment.success",
        payment_id: "pg-999",
        amount: 50123,
      }),
    );
    expect(badId.status).toBe(400);

    const badAmount = await POST(
      signedRequest({
        order_id: "reg-1",
        event: "payment.success",
        payment_id: "pg-100",
        amount: 49999,
      }),
    );
    expect(badAmount.status).toBe(400);
  });

  it("marks a waiting registration as paid and logs the raw event", async () => {
    const res = await POST(
      signedRequest({
        order_id: "reg-1",
        event: "payment.success",
        payment_id: "pg-100",
        amount: 50123,
        transaction_id: "tx-1",
      }),
    );
    expect(res.status).toBe(200);
    expect(db.events).toHaveLength(1);
    expect(db.updates).toHaveLength(1);
    expect(db.updates[0]).toMatchObject({ status: "terdaftar", paid_by: "sistem" });
  });

  it("is idempotent when the registration is already paid", async () => {
    db.reg = { ...db.reg!, status: "terdaftar" };
    const res = await POST(
      signedRequest({
        order_id: "reg-1",
        event: "payment.success",
        payment_id: "pg-100",
        amount: 50123,
      }),
    );
    expect(res.status).toBe(200);
    expect(db.updates).toHaveLength(0);
  });
});
