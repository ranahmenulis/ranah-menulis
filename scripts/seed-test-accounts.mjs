// Creates (or resets) a few confirmed test accounts in the real Supabase project so every screen can
// be tried while signed in: a plain writer, an Administrator and a Super Admin.
//
//   node scripts/seed-test-accounts.mjs            create or reset the accounts
//   node scripts/seed-test-accounts.mjs --cleanup  delete them again
//
// Addresses are seed-<kind>@seed.ranahmenulis.test (an unroutable domain: no email is ever sent).
// Passwords are random per run and written to .env.seed (git-ignored by .env*), never printed.
// Keys are read from .env.local or .env. This talks to the real project: a manual tool, not a test.
// Management roles other than the platform ones arrive with the Projects tables (Fase 4).
import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) {
  console.error("Missing Supabase keys in .env.local or .env.");
  process.exit(1);
}

const admin = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DOMAIN = "seed.ranahmenulis.test";
const ACCOUNTS = [
  { kind: "penulis", name: "Seed Penulis", username: "seed_penulis", roles: [] },
  {
    kind: "administrator",
    name: "Seed Administrator",
    username: "seed_admin",
    roles: ["administrator"],
  },
  {
    kind: "superadmin",
    name: "Seed Super Admin",
    username: "seed_superadmin",
    roles: ["super_admin"],
  },
];
const emailOf = (kind) => `seed-${kind}@${DOMAIN}`;

async function seedUsers() {
  const found = [];
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    found.push(...data.users.filter((user) => user.email?.endsWith(`@${DOMAIN}`)));
    if (data.users.length < 200) break;
  }
  return found;
}

async function cleanup() {
  const users = await seedUsers();
  for (const user of users) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  }
  return users.length;
}

if (process.argv.includes("--cleanup")) {
  console.log(`${await cleanup()} seed account(s) deleted.`);
  process.exit(0);
}

await cleanup();
const lines = ["# Seed accounts (generated; not committed). Passwords change on every run."];
for (const account of ACCOUNTS) {
  const password = `Seed${randomBytes(9).toString("hex")}1!`;
  const { data, error } = await admin.auth.admin.createUser({
    email: emailOf(account.kind),
    password,
    email_confirm: true,
  });
  if (error) throw error;
  const id = data.user.id;
  const profile = await admin
    .from("profiles")
    .update({
      display_name: account.name,
      username: account.username,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (profile.error) throw profile.error;
  for (const role of account.roles) {
    const grant = await admin.from("platform_roles").insert({ user_id: id, role });
    if (grant.error) throw grant.error;
  }
  const key = account.kind.toUpperCase();
  lines.push(`SEED_${key}_EMAIL=${emailOf(account.kind)}`, `SEED_${key}_PASSWORD=${password}`);
}
writeFileSync(".env.seed", `${lines.join("\n")}\n`);
console.log(`${ACCOUNTS.length} seed accounts ready. Addresses and passwords are in .env.seed.`);
