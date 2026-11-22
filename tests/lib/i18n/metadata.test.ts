import { describe, expect, it, vi } from "vitest";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const holder = vi.hoisted(() => ({ dictionary: null as unknown as Dictionary }));
vi.mock("@/lib/i18n/server", () => ({ getDictionary: async () => holder.dictionary }));

import { pageTitle, titleWith } from "@/lib/i18n/metadata";

describe("page titles", () => {
  it("joins page names and the brand in Indonesian", async () => {
    holder.dictionary = dictionaries.id;
    expect(await pageTitle("streak", "studio")).toBe("Streak · Studio · RanahMenulis");
  });

  it("translates the page names in English", async () => {
    holder.dictionary = dictionaries.en;
    expect(await pageTitle("home")).toBe("Home · RanahMenulis");
    expect(await pageTitle("statistics", "studio")).toBe("Statistics · Studio · RanahMenulis");
  });

  it("puts a data name first and an optional translated prefix before it", async () => {
    holder.dictionary = dictionaries.en;
    expect(await titleWith("Lomba Hujan", ["projects"])).toBe(
      "Lomba Hujan · Projects · RanahMenulis",
    );
    expect(await titleWith("Lomba Hujan", ["projects"], "pay")).toBe(
      "Pay: Lomba Hujan · Projects · RanahMenulis",
    );
  });

  it("has an English name for every Indonesian page name", () => {
    expect(Object.keys(dictionaries.en.titles)).toEqual(Object.keys(dictionaries.id.titles));
    for (const [key, value] of Object.entries(dictionaries.en.titles)) {
      expect(value, key).not.toBe("");
    }
  });
});
