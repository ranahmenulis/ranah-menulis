import { describe, expect, it } from "vitest";
import {
  countdownLabel,
  dateLeaf,
  elapsed,
  spanLabel,
} from "@/features/community/events/event-face";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("spanLabel", () => {
  it("names the two largest units", () => {
    expect(spanLabel(2 * DAY + 3 * HOUR + 5 * MIN)).toBe("2 hari 3 jam");
    expect(spanLabel(2 * DAY)).toBe("2 hari");
    expect(spanLabel(5 * HOUR + 12 * MIN)).toBe("5 jam 12 menit");
    expect(spanLabel(4 * MIN + 30_000)).toBe("4 menit");
    expect(spanLabel(20_000)).toBe("kurang dari 1 menit");
  });
});

describe("countdownLabel", () => {
  const event = { startsAt: 10 * DAY, endsAt: 12 * DAY };
  it("counts to the start, then to the end, then says it is over", () => {
    expect(countdownLabel(event, 9 * DAY)).toBe("Mulai dalam 1 hari");
    expect(countdownLabel(event, 11 * DAY)).toBe("Berakhir dalam 1 hari");
    expect(countdownLabel(event, 12 * DAY)).toBe("Event sudah selesai");
  });
});

describe("elapsed", () => {
  const event = { startsAt: 100, endsAt: 200 };
  it("is 0 before, the share during, and 1 after", () => {
    expect(elapsed(event, 50)).toBe(0);
    expect(elapsed(event, 150)).toBe(0.5);
    expect(elapsed(event, 300)).toBe(1);
  });
});

describe("dateLeaf", () => {
  it("reads the day in the event's own zone", () => {
    // 17:30 UTC on 19 November is already 20 November in WIB (UTC+7).
    const at = Date.UTC(2026, 10, 19, 17, 30);
    expect(dateLeaf(at, "WIB")).toMatchObject({ day: "20", month: "Nov", weekday: "Jumat" });
  });
});
