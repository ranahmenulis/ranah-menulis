import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BarChart } from "@/features/studio/components/statistics/bar-chart";
import { statistics } from "@/features/studio/statistics";

afterEach(cleanup);

const TODAY = "2026-11-15";
const words = new Map([
  ["2026-11-13", 320],
  ["2026-11-14", 640],
  ["2026-11-15", 90],
]);
const t500 = [{ from: "2026-01-01", value: 500 }];

function setup(period: "day" | "week" | "month" = "day", changes = t500) {
  const { buckets } = statistics(words, changes, TODAY, period);
  render(<BarChart buckets={buckets} period={period} />);
  return screen.getByRole("group", { name: /^Kata per/ });
}

const readout = () => screen.getByRole("group").getAttribute("aria-describedby");
const readoutText = () => document.getElementById(readout()!)?.textContent;

describe("BarChart", () => {
  it("reads out the latest bar first, with its target", () => {
    setup();
    expect(readoutText()).toBe("Minggu, 15 November · 90 kata · target 500");
  });

  it("is one labelled tab stop described by the readout", () => {
    const chart = setup();
    expect(chart.getAttribute("tabindex")).toBe("0");
    expect(chart.getAttribute("aria-label")).toBe("Kata per hari, 30 hari terakhir");
    expect(chart.getAttribute("aria-roledescription")).toBe("grafik batang");
  });

  it("moves the readout with the arrow keys, Home and End, and stops at the ends", () => {
    const chart = setup();
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(readoutText()).toBe("Sabtu, 14 November · 640 kata · memenuhi target 500");
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(readoutText()).toContain("13 November · 320 kata");
    fireEvent.keyDown(chart, { key: "Home" });
    expect(readoutText()).toContain("17 Oktober · 0 kata");
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(readoutText()).toContain("17 Oktober");
    fireEvent.keyDown(chart, { key: "End" });
    expect(readoutText()).toContain("15 November");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(readoutText()).toContain("15 November");
  });

  it("follows the pointer across the plot", () => {
    const chart = setup();
    chart.getBoundingClientRect = () => ({ left: 100, width: 300 }) as DOMRect;
    // 30 bars over 300px: the second to last bar spans 380-390.
    fireEvent.pointerMove(chart, { clientX: 385 });
    expect(readoutText()).toContain("14 November");
    fireEvent.pointerMove(chart, { clientX: 5000 });
    expect(readoutText()).toContain("15 November");
    fireEvent.pointerMove(chart, { clientX: -50 });
    expect(readoutText()).toContain("17 Oktober");
  });

  it("returns a mouse to the latest bar when it leaves, but keeps a touch or keyboard pick", () => {
    const chart = setup();
    chart.getBoundingClientRect = () => ({ left: 0, width: 300 }) as DOMRect;
    fireEvent.pointerMove(chart, { clientX: 5 });
    expect(readoutText()).toContain("17 Oktober");
    fireEvent.pointerLeave(chart, { pointerType: "touch" });
    expect(readoutText()).toContain("17 Oktober");
    fireEvent.pointerLeave(chart, { pointerType: "mouse" });
    expect(readoutText()).toContain("15 November");

    fireEvent.focus(chart);
    fireEvent.keyDown(chart, { key: "Home" });
    fireEvent.pointerLeave(chart, { pointerType: "mouse" });
    expect(readoutText()).toContain("17 Oktober");
  });

  it("ignores the pointer while the plot has no size", () => {
    const chart = setup();
    fireEvent.pointerMove(chart, { clientX: 50 });
    expect(readoutText()).toContain("15 November");
  });

  it("announces the readout only while the chart has focus", () => {
    const chart = setup();
    const caption = document.getElementById(readout()!)!;
    expect(caption.getAttribute("aria-live")).toBe("off");
    fireEvent.focus(chart);
    expect(caption.getAttribute("aria-live")).toBe("polite");
    fireEvent.blur(chart);
    expect(caption.getAttribute("aria-live")).toBe("off");
  });

  it("names the target line on the daily view only when a target applies", () => {
    setup();
    expect(screen.getByText("Target harian")).toBeTruthy();
    cleanup();
    setup("day", []);
    expect(screen.queryByText("Target harian")).toBeNull();
    cleanup();
    setup("week");
    expect(screen.queryByText("Target harian")).toBeNull();
  });

  it("describes a week by its days against the target", () => {
    setup("week");
    expect(readoutText()).toBe("Minggu 9–15 Nov · 1.050 kata · 1 dari 2 hari memenuhi target");
  });

  it("draws a bar only for days with words", () => {
    const chart = setup();
    // 3 of the 30 days have words; the bars are the only elements with an inline height.
    expect(chart.querySelectorAll("span[style*='height: ']:not(.h-px)").length).toBe(3);
  });
});
