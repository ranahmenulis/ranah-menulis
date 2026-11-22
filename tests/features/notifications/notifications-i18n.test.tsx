import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";
import { notifications as en } from "@/features/notifications/copy/en";
import { dayGroups } from "@/features/notifications/notification-days";
import { NotificationList } from "@/features/notifications/notification-list";
import type { NotificationView } from "@/features/notifications/notification-model";
import { agoLabel, leadOf, textOf } from "@/features/notifications/notification-text";
import { notificationFixtures } from "@/features/notifications/fixtures";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(cleanup);

const MIN = 60_000;
const NOW = new Date(2026, 10, 22, 12, 0).getTime();

const view = (index: number): NotificationView => ({ ...notificationFixtures[index], read: false });

describe("notification sentences", () => {
  it("builds the fixture sentences from keys in both languages", () => {
    const reply = view(0);
    expect(textOf(reply)).toBe("membalas komentarmu di “Bahasa yang Kupakai untuk Memarahi Adik”.");
    expect(textOf(reply, en.messages)).toBe(
      "replied to your comment on “Bahasa yang Kupakai untuk Memarahi Adik”.",
    );
  });

  it("falls back to a ready-made text for producers that have not moved yet", () => {
    const old = { ...view(0), message: undefined, text: "Pembayaran Contoh diterima." };
    expect(textOf(old, en.messages)).toBe("Pembayaran Contoh diterima.");
  });

  it("merges other people into the lead in both languages", () => {
    const merged = view(2);
    expect(leadOf(merged)).toBe("Hafiz Rahman dan 11 orang lain");
    expect(leadOf(merged, en)).toBe("Hafiz Rahman and 11 others");
    expect(leadOf({ ...merged, others: 1 }, en)).toBe("Hafiz Rahman and 1 other");
  });

  it("writes the time label in both languages", () => {
    const item = { ...view(0), agoMs: 25 * MIN };
    expect(agoLabel(item, NOW)).toBe("25 menit lalu");
    expect(agoLabel(item, NOW, "en")).toBe("25 min ago");
    expect(agoLabel({ ...item, agoMs: 1 * MIN * 30 }, NOW, "en")).toBe("30 min ago");
  });

  it("labels the day groups with the given words", () => {
    const groups = dayGroups([view(0)], NOW, en.days);
    expect(groups[0].label).toBe("Today");
  });
});

describe("notification list in English", () => {
  it("renders the line, the time, and the day heading in English", () => {
    render(
      <I18nProvider locale="en" dictionary={dictionaries.en}>
        <NotificationList items={[view(0)]} now={NOW} onOpen={() => {}} />
      </I18nProvider>,
    );
    expect(screen.getByRole("heading", { name: /Today/ })).toBeTruthy();
    expect(screen.getByText(/replied to your comment on/)).toBeTruthy();
    expect(screen.getByText("25 min ago")).toBeTruthy();
    expect(screen.getByText("Unread.")).toBeTruthy();
  });

  it("shows the empty state in English", () => {
    render(
      <I18nProvider locale="en" dictionary={dictionaries.en}>
        <NotificationList items={[]} now={NOW} onOpen={() => {}} />
      </I18nProvider>,
    );
    expect(screen.getByText("No notifications here yet.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to Home" })).toBeTruthy();
  });
});
