import { NextResponse } from "next/server";
import { projectFixtures } from "@/features/projects/fixtures/all-projects";
import { HOLD_MS, payableIdr } from "@/features/projects/payment-model";
import { resolveProjects } from "@/features/projects/project-model";
import { registrationFee } from "@/features/projects/registration-model";
import type { Money, Project } from "@/features/projects/types";
import {
  createQrisPayment,
  fetchQrisStatus,
  paymentgtEnabled,
  resolvePaymentgtCallbackUrl,
} from "@/lib/paymentgt";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RegRow = {
  id: string;
  slug: string;
  user_id: string;
  status: string;
  package_name: string | null;
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

function isSameOriginPost(req: Request): boolean {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().includes("application/json")) return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const reqOrigin = new URL(req.url).origin;
    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const configured = site && /^https?:\/\//.test(site) ? new URL(site).origin : null;
    return origin === reqOrigin || (configured !== null && origin === configured);
  } catch {
    return false;
  }
}

async function resolveServerAmountIdr(
  admin: ReturnType<typeof createAdminClient>,
  slug: string,
  packageName: string | null,
): Promise<number | null> {
  const { data } = await admin
    .from("projects")
    .select("category,fee,block,publication")
    .eq("slug", slug)
    .maybeSingle();

  if (data) {
    if (data.publication !== "terbit") return null;
    const block = data.block as Project["block"] | null;
    if (data.category === "solo" && block?.kind === "solo") {
      const pack = block.packages.find((p) => p.name === packageName);
      return pack ? payableIdr(pack.fee) : null;
    }
    return payableIdr((data.fee as Money | null) ?? {});
  }

  const fixture = projectFixtures.find((p) => p.slug === slug && p.publication === "terbit");
  if (!fixture) return null;
  const [project] = resolveProjects([fixture], Date.now());
  if (
    project.block.kind === "solo" &&
    !project.block.packages.some((p) => p.name === packageName)
  ) {
    return null;
  }
  return payableIdr(registrationFee(project, packageName ?? undefined));
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

async function parseChargeSlug(req: Request): Promise<string | null> {
  const body = (await req.json().catch(() => null)) as { slug?: unknown } | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  return slug || null;
}

/** Creates or returns an active PaymentGT QRIS charge for the signed-in user's registration. */
export async function POST(req: Request) {
  if (!isSameOriginPost(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!paymentgtEnabled()) return NextResponse.json({ enabled: false }, { status: 200 });
  const supabase = await createClient();
  const userId = (await supabase.auth.getClaims()).data?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const slug = await parseChargeSlug(req);
  if (!slug) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const admin = createAdminClient();
  const { data: regData } = await admin
    .from("project_registrations")
    .select(
      "id,slug,user_id,status,package_name,registered_at,amount_idr,unique_amount,paymentgt_id,qris_string,qris_expires_at",
    )
    .eq("slug", slug)
    .eq("user_id", userId)
    .maybeSingle();

  const reg = regData as RegRow | null;
  if (!reg) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (reg.status === "terdaftar") return NextResponse.json({ enabled: true, status: "paid" });

  const amountIdr = await resolveServerAmountIdr(admin, reg.slug, reg.package_name);
  if (!amountIdr || amountIdr <= 0) {
    return NextResponse.json({ error: "not_payable" }, { status: 400 });
  }

  const remainingMin = Math.floor((Date.parse(reg.registered_at) + HOLD_MS - Date.now()) / 60_000);
  if (remainingMin < 1) return NextResponse.json({ enabled: true, status: "expired" });

  const reused = activeQrisResponse(reg, amountIdr);
  if (reused) return reused;

  try {
    const created = await createQrisPayment({
      orderId: reg.id,
      amountIdr,
      expiresInMinutes: Math.min(remainingMin, 120),
      callbackUrl: resolvePaymentgtCallbackUrl(siteOrigin(req)),
    });
    await admin
      .from("project_registrations")
      .update({
        amount_idr: amountIdr,
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
