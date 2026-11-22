import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatNumber } from "@/lib/i18n/format";

const MS = Date.UTC(2026, 10, 25, 7, 30); // 25 Nov 2026, 14.30 in WIB

describe("formatNumber", () => {
  it("uses the thousands separator of each language", () => {
    expect(formatNumber(1234567, "id")).toBe("1.234.567");
    expect(formatNumber(1234567, "en")).toBe("1,234,567");
  });
});

describe("formatDate and formatDateTime", () => {
  it("orders day and month the way each language does", () => {
    const options = { timeZone: "Asia/Jakarta" };
    expect(
      formatDate(MS, "id", { day: "numeric", month: "short", year: "numeric", ...options }),
    ).toBe("25 Nov 2026");
    expect(
      formatDate(MS, "en", { day: "numeric", month: "short", year: "numeric", ...options }),
    ).toBe("Nov 25, 2026");
  });

  it("adds the clock time in the given zone", () => {
    const wib = formatDateTime(MS, "id", { timeZone: "Asia/Jakarta" });
    const myt = formatDateTime(MS, "id", { timeZone: "Asia/Kuala_Lumpur" });
    expect(wib).toContain("14.30");
    expect(myt).toContain("15.30");
    expect(formatDateTime(MS, "en", { timeZone: "Asia/Jakarta" })).toContain("14:30");
  });
});
