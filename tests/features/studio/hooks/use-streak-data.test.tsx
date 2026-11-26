import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ACCOUNT, parseAccount } from "@/features/account/account-model";
import { LiveAccountContext } from "@/features/account/live-account-context";
import * as accountStore from "@/features/account/account-store";
import { useStreakData } from "@/features/studio/hooks/use-streak-data";
import type { DocumentStore } from "@/features/studio/storage/document-store";

vi.mock("@/features/account/delete-account", () => ({
  deleteOwnAccount: vi.fn(),
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("useStreakData", () => {
  it("reads and saves daily targets on account prefs when signed in", async () => {
    const store = {
      history: async () => [],
      listSummaries: async () => [],
    } as unknown as DocumentStore;
    const account = {
      ...DEFAULT_ACCOUNT,
      registered: true,
      prefs: {
        ...DEFAULT_ACCOUNT.prefs,
        dailyTargets: [{ from: "2020-01-01", value: 750 }],
      },
    };
    const saveSpy = vi.spyOn(accountStore, "saveAccount").mockReturnValue(true);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <LiveAccountContext.Provider value={account}>{children}</LiveAccountContext.Provider>
    );

    const { result } = renderHook(() => useStreakData(store), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.target).toBe(750);

    act(() => result.current.setTarget(1000));
    expect(saveSpy).toHaveBeenCalledWith({
      prefs: {
        dailyTargets: [
          { from: "2020-01-01", value: 750 },
          { from: expect.any(String), value: 1000 },
        ],
      },
    });
  });

  it("parses valid dailyTargets from account prefs and drops malformed entries", () => {
    const parsed = parseAccount(
      JSON.stringify({
        prefs: {
          dailyTargets: [
            { from: "2026-11-01", value: 500 },
            { from: "2026-11-02", value: -10 },
            "bad",
          ],
        },
      }),
    );
    expect(parsed.prefs.dailyTargets).toEqual([{ from: "2026-11-01", value: 500 }]);
  });
});
