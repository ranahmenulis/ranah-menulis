import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getPaymentgtEnv } from "./env.server";

/**
 * Server-only client for the self-hosted QRIS gateway "PaymentGT" (same protocol as beyond-studio).
 * Creates dynamic QRIS charges, verifies HMAC-SHA256 settlement webhooks, and supports direct
 * status polling as a fallback when callbacks cannot reach localhost or are delayed.
 */

export function paymentgtEnabled(): boolean {
  return getPaymentgtEnv() !== null;
}

const PRIVATE_HOST =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|::1|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;

/** Resolves the server-to-server webhook URL; omits loopback/private origins (anti-SSRF). */
export function resolvePaymentgtCallbackUrl(origin?: string): string | undefined {
  const env = getPaymentgtEnv();
  if (env?.callbackUrl) return env.callbackUrl;
  if (!origin) return undefined;
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (PRIVATE_HOST.test(host) || host.endsWith(".local") || host.endsWith(".internal")) {
      return undefined;
    }
    return `${origin.replace(/\/+$/, "")}/api/paymentgt/webhook`;
  } catch {
    return undefined;
  }
}

export type CreateQrisInput = {
  orderId: string;
  amountIdr: number;
  expiresInMinutes: number;
  callbackUrl?: string;
};

export type CreateQrisResult = {
  paymentgtId: string;
  uniqueAmount: number;
  qrisString: string;
  qrisImageBase64?: string;
  expiredAt: string;
};

export async function createQrisPayment(input: CreateQrisInput): Promise<CreateQrisResult> {
  const env = getPaymentgtEnv();
  if (!env) throw new Error("PaymentGT is not configured.");
  const res = await fetch(`${env.baseUrl}/api/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: input.orderId,
      amount: input.amountIdr,
      expires_in_minutes: input.expiresInMinutes,
      ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    json = null;
  }
  if (!res.ok || !json?.success || typeof json.qris_string !== "string") {
    throw new Error(`PaymentGT create payment failed (${res.status})`);
  }
  const exp = typeof json.expires_at === "string" ? Date.parse(json.expires_at) : NaN;
  return {
    paymentgtId: String(json.payment_id),
    uniqueAmount: Number(json.unique_amount),
    qrisString: json.qris_string,
    qrisImageBase64:
      typeof json.qris_image_base64 === "string" ? json.qris_image_base64 : undefined,
    expiredAt: Number.isNaN(exp)
      ? new Date(Date.now() + input.expiresInMinutes * 60_000).toISOString()
      : new Date(exp).toISOString(),
  };
}

export type QrisGatewayStatus = "pending" | "paid" | "expired" | "cancelled";

/** Fallback polling when webhook is unavailable (dev/localhost) or delayed. */
export async function fetchQrisStatus(
  paymentgtId: string,
): Promise<{ status: QrisGatewayStatus } | null> {
  const env = getPaymentgtEnv();
  if (!env) return null;
  try {
    const res = await fetch(`${env.baseUrl}/api/payments/${encodeURIComponent(paymentgtId)}`, {
      headers: { Authorization: `Bearer ${env.apiToken}` },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { status?: unknown };
    const st = json?.status;
    if (st === "pending" || st === "paid" || st === "expired" || st === "cancelled") {
      return { status: st };
    }
    return null;
  } catch {
    return null;
  }
}

const WEBHOOK_MAX_AGE_SECONDS = 10 * 60;

/** Verifies `X-PaymentGT-Signature: v1=...` with HMAC-SHA256 and a 10-minute replay window. */
export function verifyQrisWebhook(headers: Headers, rawBody: string, nowMs = Date.now()): boolean {
  const secret = getPaymentgtEnv()?.webhookSecret;
  if (!secret) return false;
  const timestamp = headers.get("x-paymentgt-timestamp");
  const received = headers.get("x-paymentgt-signature");
  if (!timestamp || !received) return false;
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowMs / 1000 - ts) > WEBHOOK_MAX_AGE_SECONDS) return false;

  const mac = createHmac("sha256", secret);
  mac.update(timestamp);
  mac.update(".");
  mac.update(rawBody);
  const expected = `v1=${mac.digest("base64")}`;

  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Second-layer check: settlement must match the `paymentgt_id` issued for this registration. */
export function qrisWebhookMatchesRegistration(
  expectedPaymentId: string | null | undefined,
  incomingPaymentId: unknown,
): boolean {
  return (
    typeof expectedPaymentId === "string" &&
    expectedPaymentId.length > 0 &&
    typeof incomingPaymentId === "string" &&
    incomingPaymentId === expectedPaymentId
  );
}
