import { describe, expect, it } from "vitest";
import { paymentNotifications } from "@/features/projects/payment-notifications";
import { HOLD_MS } from "@/features/projects/payment-model";
import { NOW, project, registration } from "./helpers";

const slug = "lomba-cerpen-hujan-2026";
const projects = [project(slug), project("kelas-cerpen-untuk-pemula")];
const waiting = registration(slug, { status: "menunggu-pembayaran", registeredAt: NOW });

describe("paymentNotifications", () => {
  it("tells that payment waits, pointing to the payment page", () => {
    const [n] = paymentNotifications(projects, { [slug]: waiting }, NOW + 1000);
    expect(n.text).toMatch(/menunggu/);
    expect(n.href).toBe(`/projects/${slug}/bayar`);
    expect(n.at).toBe(NOW);
  });

  it("tells that payment arrived, once, with the moment it did", () => {
    const paid = { ...waiting, status: "terdaftar" as const, paidAt: NOW + 5000 };
    const result = paymentNotifications(projects, { [slug]: paid }, NOW + 9000);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ at: NOW + 5000, href: `/projects/${slug}` });
    expect(result[0].text).toMatch(/diterima/);
  });

  it("tells that the hold ran out, with a new id so it is a new event", () => {
    const [waitingN] = paymentNotifications(projects, { [slug]: waiting }, NOW);
    const [expired] = paymentNotifications(projects, { [slug]: waiting }, NOW + HOLD_MS);
    expect(expired.text).toMatch(/habis/);
    expect(expired.id).not.toBe(waitingN.id);
    expect(expired.at).toBe(NOW + HOLD_MS);
  });

  it("says nothing for free registrations or ones confirmed before payments were recorded", () => {
    const free = registration("kelas-cerpen-untuk-pemula");
    const old = registration(slug);
    expect(paymentNotifications(projects, { [free.slug]: free, [slug]: old }, NOW)).toEqual([]);
  });
});
