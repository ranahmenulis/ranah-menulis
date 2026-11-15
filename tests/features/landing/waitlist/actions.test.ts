import { beforeEach, describe, expect, it, vi } from "vitest";
import { joinWaitlist } from "@/features/landing/waitlist/actions";
import { initialWaitlistState } from "@/features/landing/waitlist/state";

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));

// The real module imports "server-only" and needs secrets; the action only uses from().insert().
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from }) }));

function form(fields: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

const valid = { name: "Siti", email: "siti@example.com", country: "ID" };

beforeEach(() => {
  insert.mockReset();
  from.mockClear();
  insert.mockResolvedValue({ error: null });
});

describe("joinWaitlist", () => {
  it("rejects an empty name and email without touching the database", async () => {
    const state = await joinWaitlist(initialWaitlistState, form({ name: "  ", email: "" }));

    expect(state.status).toBe("invalid");
    expect(state.errors.name).toBeTruthy();
    expect(state.errors.email).toBeTruthy();
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects an email without a proper domain", async () => {
    const state = await joinWaitlist(
      initialWaitlistState,
      form({ ...valid, email: "siti@example" }),
    );

    expect(state.status).toBe("invalid");
    expect(state.errors.email).toBeTruthy();
    expect(state.errors.name).toBeUndefined();
    expect(from).not.toHaveBeenCalled();
  });

  it("pretends to succeed for bots that fill the hidden field, and stores nothing", async () => {
    const state = await joinWaitlist(
      initialWaitlistState,
      form({ ...valid, website: "http://spam.example" }),
    );

    expect(state.status).toBe("success");
    expect(from).not.toHaveBeenCalled();
  });

  it("inserts a trimmed, validated signup and reports success", async () => {
    const state = await joinWaitlist(
      initialWaitlistState,
      form({
        name: `  ${"a".repeat(100)}  `,
        email: "  siti@example.com ",
        country: "MY",
        interests: ["Antologi", "Not a real interest", "Lomba"],
      }),
    );

    expect(state.status).toBe("success");
    expect(from).toHaveBeenCalledWith("waitlist_signups");
    expect(insert).toHaveBeenCalledWith({
      name: "a".repeat(80),
      email: "siti@example.com",
      country: "MY",
      interests: ["Antologi", "Lomba"],
    });
  });

  it("falls back to ID for an unknown country", async () => {
    await joinWaitlist(initialWaitlistState, form({ ...valid, country: "ZZ" }));

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ country: "ID" }));
  });

  it("reports 'exists' when the email is already registered (unique violation)", async () => {
    insert.mockResolvedValue({ error: { code: "23505" } });

    const state = await joinWaitlist(initialWaitlistState, form(valid));

    expect(state.status).toBe("exists");
  });

  it("reports 'failed' for any other database error, keeping the entered values", async () => {
    insert.mockResolvedValue({ error: { code: "XX000" } });

    const state = await joinWaitlist(initialWaitlistState, form(valid));

    expect(state.status).toBe("failed");
    expect(state.values.email).toBe(valid.email);
  });

  it("reports 'failed' when the database call throws", async () => {
    insert.mockRejectedValue(new Error("network down"));

    const state = await joinWaitlist(initialWaitlistState, form(valid));

    expect(state.status).toBe("failed");
  });
});
