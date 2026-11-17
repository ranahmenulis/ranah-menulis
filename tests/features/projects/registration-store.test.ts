import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseRegistrations,
  saveRegistration,
  useRegistrations,
} from "@/features/projects/registration-store";
import type { Registration } from "@/features/projects/types";

const KEY = "ranah.registrations";
const sample: Registration = {
  slug: "lomba-cerpen-hujan-2026",
  registeredAt: 1000,
  agreedAt: 900,
  termsVersion: "1",
  status: "menunggu-pembayaran",
};

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("parseRegistrations", () => {
  it("returns nothing for empty, broken or foreign data", () => {
    expect(parseRegistrations(null)).toEqual({});
    expect(parseRegistrations("{not json")).toEqual({});
    expect(parseRegistrations("[1,2]")).toEqual({});
    expect(parseRegistrations('"text"')).toEqual({});
  });

  it("keeps well-formed records and drops malformed ones", () => {
    const raw = JSON.stringify({
      [sample.slug]: sample,
      broken: { slug: "broken", status: "lunas" },
      empty: null,
      mismatch: { ...sample, slug: "other" },
    });
    expect(Object.keys(parseRegistrations(raw))).toEqual([sample.slug]);
  });

  it("drops records whose times are not real numbers", () => {
    const raw = JSON.stringify({
      a: { ...sample, slug: "a", registeredAt: null },
      b: { ...sample, slug: "b", agreedAt: "soon" },
      c: { ...sample, slug: "c" },
    });
    expect(Object.keys(parseRegistrations(raw))).toEqual(["c"]);
  });

  it("keeps the package name only when it is text", () => {
    const raw = JSON.stringify({ [sample.slug]: { ...sample, packageName: 5 } });
    expect(parseRegistrations(raw)[sample.slug].packageName).toBeUndefined();
  });
});

describe("useRegistrations and saveRegistration", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useRegistrations());
    expect(result.current).toEqual({});
  });

  it("shows a saved registration right away and keeps it on the device", () => {
    const { result } = renderHook(() => useRegistrations());
    act(() => saveRegistration(sample));
    expect(result.current[sample.slug]).toEqual(sample);
    expect(JSON.parse(localStorage.getItem(KEY) as string)[sample.slug]).toEqual(sample);
  });

  it("reads what an earlier visit stored", () => {
    localStorage.setItem(KEY, JSON.stringify({ [sample.slug]: sample }));
    const { result } = renderHook(() => useRegistrations());
    expect(result.current[sample.slug]).toEqual(sample);
  });

  it("keeps other projects when one more is saved", () => {
    const { result } = renderHook(() => useRegistrations());
    act(() => saveRegistration(sample));
    act(() => saveRegistration({ ...sample, slug: "b" }));
    expect(Object.keys(result.current).sort()).toEqual(["b", sample.slug]);
  });

  it("registers a project once: a second save for it changes nothing", () => {
    const { result } = renderHook(() => useRegistrations());
    act(() => saveRegistration({ ...sample, status: "terdaftar", packageName: "A" }));
    act(() => saveRegistration({ ...sample, status: "menunggu-pembayaran", packageName: "B" }));
    expect(result.current[sample.slug]).toMatchObject({ status: "terdaftar", packageName: "A" });
  });

  it("follows the storage being cleared in another tab", () => {
    const { result } = renderHook(() => useRegistrations());
    act(() => saveRegistration(sample));
    expect(result.current[sample.slug]).toBeTruthy();
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent("storage", { key: null }));
    });
    expect(result.current).toEqual({});
  });

  it("falls back to memory for this tab when the storage refuses the write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { result } = renderHook(() => useRegistrations());
    act(() => saveRegistration({ ...sample, slug: "memory-only" }));
    expect(result.current["memory-only"]).toBeTruthy();
  });
});

describe("saveRegistration over an expired hold", () => {
  const read = () => JSON.parse(localStorage.getItem("ranah.registrations") ?? "{}");

  it("replaces a registration whose payment hold ran out, and keeps one that still holds", () => {
    const old = { ...sample, status: "menunggu-pembayaran" as const, registeredAt: 1000 };
    saveRegistration(old);
    const fresh = { ...old, registeredAt: 1000 + 25 * 3_600_000, agreedAt: 1000 + 25 * 3_600_000 };
    saveRegistration(fresh);
    expect(read()[sample.slug].registeredAt).toBe(fresh.registeredAt);
    saveRegistration({ ...fresh, registeredAt: fresh.registeredAt + 1000 });
    expect(read()[sample.slug].registeredAt).toBe(fresh.registeredAt);
  });
});
