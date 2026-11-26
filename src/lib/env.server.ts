import "server-only";

/** The service-role key. Server only: importing this from a client component fails the build. */
export function getSupabaseSecretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SECRET_KEY. Copy .env.example to .env.local and fill it in.");
  }
  return key;
}

export type PaymentgtEnv = {
  baseUrl: string;
  apiToken: string;
  webhookSecret: string;
  callbackUrl?: string;
};

/** Optional PaymentGT QRIS gateway configuration. Returns null when not configured. */
export function getPaymentgtEnv(): PaymentgtEnv | null {
  const baseUrl = process.env.PAYMENTGT_BASE_URL?.trim();
  const apiToken = process.env.PAYMENTGT_API_TOKEN?.trim();
  const webhookSecret = process.env.PAYMENTGT_WEBHOOK_SECRET?.trim();
  if (!baseUrl || !apiToken || !webhookSecret) return null;
  const callbackUrl = process.env.PAYMENTGT_CALLBACK_URL?.trim() || undefined;
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiToken,
    webhookSecret,
    callbackUrl,
  };
}
