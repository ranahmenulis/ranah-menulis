"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { countries, type WaitlistState, type WaitlistValues } from "./state";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERESTS = ["Menulis rutin", "Antologi", "Buku solo", "Kelas", "Lomba", "Membaca"];

/** Pesan galat dari docs/Copy Landing RanahMenulis.md: pendek, spesifik, memberi langkah berikutnya. */
export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Jebakan bot: kolom tersembunyi yang tidak diisi manusia. Pura-pura sukses.
  const values: WaitlistValues = {
    name: String(formData.get("name") ?? "").trim().slice(0, 80),
    email: String(formData.get("email") ?? "").trim().slice(0, 254),
    country: String(formData.get("country") ?? "ID"),
    interests: formData.getAll("interests").map(String).filter((i) => INTERESTS.includes(i)),
  };
  if (!countries.some((c) => c.value === values.country)) values.country = "ID";

  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success", values, errors: {} };
  }

  const errors: WaitlistState["errors"] = {};
  if (!values.name) errors.name = "Isi nama panggilanmu dulu.";
  if (!values.email) errors.email = "Isi alamat emailmu.";
  else if (!EMAIL.test(values.email)) errors.email = "Alamat email belum lengkap. Contoh: nama@domain.com";
  if (errors.name || errors.email) return { status: "invalid", values, errors };

  try {
    const { error } = await createAdminClient().from("waitlist_signups").insert({
      name: values.name,
      email: values.email,
      country: values.country,
      interests: values.interests,
    });
    if (error) {
      // 23505 = email sudah ada (indeks unik huruf kecil). Kabar, bukan galat.
      if (error.code === "23505") return { status: "exists", values, errors: {} };
      return { status: "failed", values, errors: {} };
    }
  } catch {
    return { status: "failed", values, errors: {} };
  }

  return { status: "success", values, errors: {} };
}
