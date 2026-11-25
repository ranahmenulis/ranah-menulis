import { createClient } from "@/lib/supabase/client";
import type { AccountGateway } from "./account-gateway";

/** Writes the profile through the browser client, so Row Level Security decides who may. */
export const supabaseAccountGateway: AccountGateway = {
  async updateProfile(userId, update) {
    try {
      const { data, error } = await createClient()
        .from("profiles")
        .update(update)
        .eq("id", userId)
        .select("id");
      return !error && (data?.length ?? 0) === 1;
    } catch {
      return false;
    }
  },
};
