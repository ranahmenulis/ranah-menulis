import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { qrisWebhookMatchesRegistration, verifyQrisWebhook } from "@/lib/paymentgt";

export const runtime = "nodejs";

type WebhookPayload = {
  order_id?: unknown;
  event?: unknown;
  amount?: unknown;
  payment_id?: unknown;
  transaction_id?: unknown;
};

async function logPaymentEvent(
  admin: ReturnType<typeof createAdminClient>,
  orderId: string,
  event: string,
  amount: number,
  body: WebhookPayload,
) {
  await admin
    .from("payment_events")
    .insert({
      registration_id: orderId,
      provider: "paymentgt",
      event_type: event || "unknown",
      amount: Number.isFinite(amount) ? Math.round(amount) : null,
      tx_id: typeof body.transaction_id === "string" ? body.transaction_id : null,
      payload: body,
    })
    .then(
      () => undefined,
      () => undefined,
    );
}

function amountMismatches(reg: { unique_amount: unknown; amount_idr: unknown }, amount: number) {
  const expected = (reg.unique_amount ?? reg.amount_idr) as number | null;
  return expected !== null && Number.isFinite(amount) && Math.round(amount) !== expected;
}

/**
 * PaymentGT settlement webhook (`POST /api/paymentgt/webhook`).
 * Verifies HMAC-SHA256 signature and timestamp, logs the raw event to `payment_events`,
 * checks `payment_id` match, and idempotently marks the registration as paid.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyQrisWebhook(req.headers, raw)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = JSON.parse(raw) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const orderId = typeof body.order_id === "string" ? body.order_id.trim() : "";
  const event = typeof body.event === "string" ? body.event : "";
  const amount = Number(body.amount);
  if (!orderId) return NextResponse.json({ error: "no order_id" }, { status: 400 });

  const admin = createAdminClient();
  await logPaymentEvent(admin, orderId, event, amount, body);
  if (event !== "payment.success") return NextResponse.json({ ok: true });

  const { data: reg, error: readError } = await admin
    .from("project_registrations")
    .select("id,status,paymentgt_id,unique_amount,amount_idr")
    .eq("id", orderId)
    .maybeSingle();

  if (readError) return NextResponse.json({ error: "server error" }, { status: 500 });
  if (!reg) return NextResponse.json({ error: "order not found" }, { status: 404 });
  if (!qrisWebhookMatchesRegistration(reg.paymentgt_id as string | null, body.payment_id)) {
    return NextResponse.json({ error: "order mismatch" }, { status: 400 });
  }
  if (amountMismatches(reg, amount)) {
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  if (reg.status === "menunggu-pembayaran") {
    const { error: updError } = await admin
      .from("project_registrations")
      .update({ status: "terdaftar", paid_at: new Date().toISOString(), paid_by: "sistem" })
      .eq("id", orderId)
      .eq("status", "menunggu-pembayaran");
    if (updError) return NextResponse.json({ error: "server error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
