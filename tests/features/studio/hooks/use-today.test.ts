import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { resetAccount, saveAccount } from "@/features/account/account-store";
import { useToday } from "@/features/studio/hooks/use-today";

afterEach(() => {
  cleanup();
  resetAccount();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

it("uses the account day across midnight and updates when the zone changes", () => {
  vi.stubEnv("TZ", "UTC");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-19T17:30:00Z"));
  expect(new Date().getDate()).toBe(19);
  saveAccount({ profile: { timeZone: "Asia/Jakarta" } });

  const { result } = renderHook(() => useToday());
  expect(result.current).toBe("2026-11-20");

  act(() => {
    saveAccount({ profile: { timeZone: "UTC" } });
  });
  expect(result.current).toBe("2026-11-19");
});
