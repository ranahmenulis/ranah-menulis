import { describe, expect, it, vi } from "vitest";
import type { DocumentStore } from "@/features/studio/storage/document-store";
import { createSwitchingStore } from "@/features/studio/storage/remote/switching-store";

const fake = (name: string) =>
  ({ get: vi.fn(async (id: string) => ({ name, id })) }) as unknown as DocumentStore;

describe("createSwitchingStore", () => {
  it("uses the device store for a visitor and the account store once signed in", async () => {
    const device = fake("device");
    const account = fake("account");
    let signedIn = false;
    const store = createSwitchingStore(
      () => device,
      async () => (signedIn ? account : null),
    );

    expect(await store.get("a")).toEqual({ name: "device", id: "a" });
    signedIn = true;
    expect(await store.get("b")).toEqual({ name: "account", id: "b" });
    signedIn = false;
    expect(await store.get("c")).toEqual({ name: "device", id: "c" });
  });
});
