import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  paymentgtEnabled,
  qrisWebhookMatchesRegistration,
  resolvePaymentgtCallbackUrl,
  verifyQrisWebhook,
} from "@/lib/paymentgt";

function sign(secret: string, timestamp: string, rawBody: string): string {
  return `v1=${createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("base64")}`;
}

describe("paymentgt", () => {
  afterEach(() => {
    delete process.env.PAYMENTGT_BASE_URL;
    delete process.env.PAYMENTGT_API_TOKEN;
    delete process.env.PAYMENTGT_WEBHOOK_SECRET;
    delete process.env.PAYMENTGT_CALLBACK_URL;
  });

  it("reports disabled until all three required env vars are set", () => {
    expect(paymentgtEnabled()).toBe(false);
    process.env.PAYMENTGT_BASE_URL = "https://pay.example.com";
    process.env.PAYMENTGT_API_TOKEN = "tok";
    process.env.PAYMENTGT_WEBHOOK_SECRET = "sec";
    expect(paymentgtEnabled()).toBe(true);
  });

  it("omits loopback and private origins from callback_url (anti-SSRF)", () => {
    expect(resolvePaymentgtCallbackUrl("http://localhost:3000")).toBeUndefined();
    expect(resolvePaymentgtCallbackUrl("http://127.0.0.1:3000")).toBeUndefined();
    expect(resolvePaymentgtCallbackUrl("http://192.168.1.5:3000")).toBeUndefined();
    expect(resolvePaymentgtCallbackUrl("https://ranah-menulis.vercel.app")).toBe(
      "https://ranah-menulis.vercel.app/api/paymentgt/webhook",
    );
  });

  it("verifies HMAC-SHA256 webhook signatures and rejects stale or tampered payloads", () => {
    process.env.PAYMENTGT_BASE_URL = "https://pay.example.com";
    process.env.PAYMENTGT_API_TOKEN = "tok";
    process.env.PAYMENTGT_WEBHOOK_SECRET = "test-secret";

    const nowMs = 1_700_000_000_000;
    const ts = String(Math.floor(nowMs / 1000));
    const body = JSON.stringify({ order_id: "reg-1", event: "payment.success", amount: 50123 });
    const headers = new Headers({
      "x-paymentgt-timestamp": ts,
      "x-paymentgt-signature": sign("test-secret", ts, body),
    });

    expect(verifyQrisWebhook(headers, body, nowMs)).toBe(true);
    expect(verifyQrisWebhook(headers, `${body} `, nowMs)).toBe(false);
    // 11 minutes later -> rejected
    expect(verifyQrisWebhook(headers, body, nowMs + 11 * 60_000)).toBe(false);
  });

  it("checks paymentgt_id match as a second layer", () => {
    expect(qrisWebhookMatchesRegistration("pg-1", "pg-1")).toBe(true);
    expect(qrisWebhookMatchesRegistration("pg-1", "pg-2")).toBe(false);
    expect(qrisWebhookMatchesRegistration(null, "pg-1")).toBe(false);
  });
});
