import { describe, expect, it } from "vitest";
import {
  confirmPayment,
  holdsSeat,
  HOLD_MS,
  liveRegistration,
  paymentDueAt,
  paymentState,
  payableIdr,
  remainingLabel,
} from "@/features/projects/payment-model";
import { registration, NOW } from "./helpers";

const waiting = registration("x", { status: "menunggu-pembayaran", registeredAt: NOW });

describe("paymentState", () => {
  it("is waiting until the hold ends, then expired", () => {
    expect(paymentState(waiting, NOW + HOLD_MS - 1)).toBe("menunggu");
    expect(paymentState(waiting, NOW + HOLD_MS)).toBe("kedaluwarsa");
    expect(paymentDueAt(waiting)).toBe(NOW + HOLD_MS);
  });

  it("is paid for a confirmed registration, whatever the time", () => {
    expect(paymentState(registration("x"), NOW + 10 * HOLD_MS)).toBe("lunas");
  });
});

describe("holdsSeat and liveRegistration", () => {
  it("keeps the seat for paid and unexpired, releases an expired one", () => {
    expect(holdsSeat(waiting, NOW)).toBe(true);
    expect(holdsSeat(waiting, NOW + HOLD_MS)).toBe(false);
    expect(liveRegistration(waiting, NOW + HOLD_MS)).toBeUndefined();
    expect(liveRegistration(waiting, NOW)).toBe(waiting);
    expect(liveRegistration(undefined, NOW)).toBeUndefined();
  });
});

describe("confirmPayment", () => {
  it("confirms a waiting registration and records when", () => {
    expect(confirmPayment(waiting, NOW + 1000)).toEqual({
      ...waiting,
      status: "terdaftar",
      paidAt: NOW + 1000,
    });
  });

  it("refuses one already paid or whose hold ran out", () => {
    expect(confirmPayment(registration("x"), NOW)).toBeNull();
    expect(confirmPayment(waiting, NOW + HOLD_MS)).toBeNull();
  });
});

describe("payableIdr", () => {
  it("pays in rupiah only; a price in ringgit alone has no way to pay yet", () => {
    expect(payableIdr({ idr: 35_000, myr: 1200 })).toBe(35_000);
    expect(payableIdr({ myr: 1200 })).toBeNull();
    expect(payableIdr({})).toBeNull();
  });
});

describe("remainingLabel", () => {
  it("rounds minutes up and drops empty parts", () => {
    expect(remainingLabel(NOW + 5 * 3_600_000 + 12 * 60_000, NOW)).toBe("sisa 5 jam 12 menit");
    expect(remainingLabel(NOW + 2 * 3_600_000, NOW)).toBe("sisa 2 jam");
    expect(remainingLabel(NOW + 1000, NOW)).toBe("sisa 1 menit");
  });
});
