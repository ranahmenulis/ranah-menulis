import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  createQrisPayment,
  fetchQrisStatus,
  paymentgtEnabled,
  resolvePaymentgtCallbackUrl,
} from "@/lib/paymentgt";
import { HOLD_MS } from "@/features/projects/payment-model";

type RegRow = {
  id: string;
  slug: string;
  user_id: string;
  status: string;
  registered_at: string;
  amount_idr: number | null;
  unique_amount: number | null;
  paymentgt_id: string | null;
  qris_string: string | null;
  qris_expires_at: string | null;
};

function siteOrigin(req: Request): string | undefined {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site && /^https?:\/\//.test(site)) return site.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") return undefined;
  return new URL(req.url).origin;
}

function activeQrisResponse(reg: RegRow, amountIdr: number) {
  if (!reg.paymentgt_id || !reg.qris_string || !reg.qris_expires_at) return null;
  if (Date.parse(reg.qris_expires_at) <= Date.now()) return null;
  return NextResponse.json({
    enabled: true,
    status: "pending",
    paymentgtId: reg.paymentgt_id,
    uniqueAmount: reg.unique_amount ?? amountIdr,
    qrisString: reg.qris_string,
    expiredAt: reg.qris_expires_at,
  });
}

async function parseChargeBody(req: Request): Promise<{ slug: string; amountIdr: number } | null> {
  const body = (await req.json().catch(() => null)) as {
    slug?: unknown;
    amountIdr?: unknown;
  } | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const amountIdr = typeof body?.amountIdr === "number" ? Math.round(body.amountIdr) : 0;
  return slug && amountIdr > 0 ? { slug, amountIdr } : null;
}

/** Creates or returns an active PaymentGT QRIS charge for the signed-in user's registration. */
export async function POST(req: Request) {
  if (!paymentgtEnabled()) return NextResponse.json({ enabled: false }, { status: 200 });
  const supabase = await createClient();
  const userId = (await supabase.auth.getClaims()).data?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = await parseChargeBody(req);
  if (!parsed) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const admin = createAdminClient();
  const { data: regData } = await admin
    .from("project_registrations")
    .select(
      "id,slug,user_id,status,registered_at,amount_idr,unique_amount,paymentgt_id,qris_string,qris_expires_at",
    )
    .eq("slug", parsed.slug)
    .eq("user_id", userId)
    .maybeSingle();

  const reg = regData as RegRow | null;
  if (!reg) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (reg.status === "terdaftar") return NextResponse.json({ enabled: true, status: "paid" });

  const remainingMin = Math.floor((Date.parse(reg.registered_at) + HOLD_MS - Date.now()) / 60_000);
  if (remainingMin < 1) return NextResponse.json({ enabled: true, status: "expired" });

  const reused = activeQrisResponse(reg, parsed.amountIdr);
  if (reused) return reused;

  try {
    const created = await createQrisPayment({
      orderId: reg.id,
      amountIdr: parsed.amountIdr,
      expiresInMinutes: Math.min(remainingMin, 120),
      callbackUrl: resolvePaymentgtCallbackUrl(siteOrigin(req)),
    });
    await admin
      .from("project_registrations")
      .update({
        amount_idr: parsed.amountIdr,
        unique_amount: created.uniqueAmount,
        paymentgt_id: created.paymentgtId,
        qris_string: created.qrisString,
        qris_expires_at: created.expiredAt,
      })
      .eq("id", reg.id);
    return NextResponse.json({ enabled: true, status: "pending", ...created });
  } catch {
    return NextResponse.json({ error: "gateway_failed" }, { status: 502 });
  }
}

/** Polls PaymentGT directly as a fallback when webhook delivery is delayed or unavailable. */
export async function GET(req: Request) {
  if (!paymentgtEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const slug = new URL(req.url).searchParams.get("slug")?.trim() ?? "";
  if (!slug) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const admin = createAdminClient();
  const { data: regData } = await admin
    .from("project_registrations")
    .select("id,status,paymentgt_id,unique_amount,registered_at")
    .eq("slug", slug)
    .eq("user_id", userId)
    .maybeSingle();

  const reg = regData as Pick<
    RegRow,
    "id" | "status" | "paymentgt_id" | "unique_amount" | "registered_at"
  > | null;
  if (!reg) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (reg.status === "terdaftar") return NextResponse.json({ enabled: true, status: "paid" });
  if (!reg.paymentgt_id) return NextResponse.json({ enabled: true, status: "pending" });

  const remote = await fetchQrisStatus(reg.paymentgt_id);
  if (remote?.status === "paid") {
    const nowIso = new Date().toISOString();
    await admin
      .from("project_registrations")
      .update({ status: "terdaftar", paid_at: nowIso, paid_by: "sistem" })
      .eq("id", reg.id)
      .eq("status", "menunggu-pembayaran");
    return NextResponse.json({ enabled: true, status: "paid" });
  }
  return NextResponse.json({ enabled: true, status: remote?.status ?? "pending" });
}
