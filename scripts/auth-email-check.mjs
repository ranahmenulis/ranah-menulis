// Sends one real Supabase sign-up confirmation email to AUTH_TEST_EMAIL so a person can check that
// the project's built-in email works (delivery, spam folder, sender, link target).
//
//   node scripts/auth-email-check.mjs            send the email (creates one unconfirmed user)
//   node scripts/auth-email-check.mjs --cleanup  delete that test user afterwards
//
// Keys and the address are read from .env.local or .env and never printed. This talks to the real
// project, so it is a manual check, not part of any test run.
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const email = process.env.AUTH_TEST_EMAIL?.trim().toLowerCase();

if (!url || !publishableKey || !secretKey) {
  console.error("Missing Supabase keys in .env.local or .env.");
  process.exit(1);
}
if (!email) {
  console.error("AUTH_TEST_EMAIL is not set. Add it to .env.local or .env (see .env.example).");
  process.exit(1);
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secretKey, options);

async function findUser() {
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((user) => user.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function removeTestUser() {
  const existing = await findUser();
  if (!existing) return false;
  const { error } = await admin.auth.admin.deleteUser(existing.id);
  if (error) throw error;
  return true;
}

if (process.argv.includes("--cleanup")) {
  console.log((await removeTestUser()) ? "Test user deleted." : "No test user to delete.");
  process.exit(0);
}

// A fresh sign-up is needed: for an address that already exists Supabase answers "ok" but sends
// nothing, which would look like a delivery failure.
if (await removeTestUser()) console.log("Removed an earlier test user with this address.");

const anon = createClient(url, publishableKey, options);
const { data, error } = await anon.auth.signUp({
  email,
  password: `Aa1-${randomUUID()}`,
});

if (error) {
  console.error(`Sign-up failed: ${error.status ?? ""} ${error.code ?? ""} ${error.message}`);
  process.exit(2);
}

const confirmed = Boolean(data.user?.email_confirmed_at);
console.log(
  `Sign-up accepted. Confirmation required: ${data.session ? "no (a session was returned)" : "yes"}.`,
);
if (confirmed) console.log("The address was already confirmed, so no email is expected.");
else console.log("Check the inbox (and spam) of the test address for the confirmation email.");
console.log("When done: node scripts/auth-email-check.mjs --cleanup");
