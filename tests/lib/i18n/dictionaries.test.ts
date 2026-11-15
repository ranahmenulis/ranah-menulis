import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/i18n/dictionaries";

/** Flattens an object to dotted key paths; arrays contribute their length and each index. */
function shape(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (Array.isArray(value)) {
    return [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${prefix}[${i}]`))];
  }
  return Object.entries(value as object).flatMap(([k, v]) =>
    shape(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("dictionaries", () => {
  it("English has exactly the keys and list lengths of Indonesian", () => {
    expect(shape(dictionaries.en)).toEqual(shape(dictionaries.id));
  });

  it("keeps the same placeholders in every translation", () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join();
    const flat = (d: unknown): string[] => {
      if (typeof d === "string") return [d];
      if (Array.isArray(d)) return d.flatMap(flat);
      return Object.values(d as object).flatMap(flat);
    };
    const id = flat(dictionaries.id);
    const en = flat(dictionaries.en);
    id.forEach((text, i) => expect(placeholders(en[i])).toBe(placeholders(text)));
  });
});
