import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseMarks,
  setMaterialDone,
  useDoneMaterials,
} from "@/features/projects/kelas/material-progress";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("parseMarks", () => {
  it("drops anything that is not a map of lists of strings", () => {
    expect(parseMarks(null)).toEqual({});
    expect(parseMarks("not json")).toEqual({});
    expect(parseMarks("[1]")).toEqual({});
    expect(parseMarks(JSON.stringify({ a: ["x", 1, null], b: "no" }))).toEqual({ a: ["x"] });
  });
});

describe("useDoneMaterials", () => {
  it("starts empty and follows marks, per class", () => {
    const { result } = renderHook(() => useDoneMaterials("kelas-a"));
    expect([...result.current]).toEqual([]);
    act(() => setMaterialDone("kelas-a", "m1", true));
    act(() => setMaterialDone("kelas-b", "m9", true));
    expect([...result.current]).toEqual(["m1"]);
  });

  it("unmarks, and a repeated mark changes nothing", () => {
    const { result } = renderHook(() => useDoneMaterials("kelas-a"));
    act(() => setMaterialDone("kelas-a", "m1", true));
    act(() => setMaterialDone("kelas-a", "m1", true));
    expect([...result.current]).toEqual(["m1"]);
    act(() => setMaterialDone("kelas-a", "m1", false));
    expect([...result.current]).toEqual([]);
  });

  it("keeps the same set while nothing changed", () => {
    const { result, rerender } = renderHook(() => useDoneMaterials("kelas-a"));
    act(() => setMaterialDone("kelas-a", "m1", true));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("shows a mark that storage refused to keep, instead of the old stored value", () => {
    localStorage.setItem("ranah.classProgress", JSON.stringify({ "kelas-a": ["m1"] }));
    const { result } = renderHook(() => useDoneMaterials("kelas-a"));
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    act(() => setMaterialDone("kelas-a", "m2", true));
    expect([...result.current].sort()).toEqual(["m1", "m2"]);
    set.mockRestore();
  });
});
