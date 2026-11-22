import { describe, expect, it } from "vitest";
import { notifications as en } from "@/features/notifications/copy/en";
import { textOf } from "@/features/notifications/notification-text";
import { paymentNotifications } from "@/features/projects/payment-notifications";
import { moneyLabel, formatProjectDate } from "@/features/projects/project-model";
import { deadlineText } from "@/features/projects/project-text";
import { NOW, project, registration } from "./helpers";

const slug = "lomba-cerpen-hujan-2026";

describe("Projects in English", () => {
  it("words the deadline and the fee in English", () => {
    const p = project(slug);
    expect(deadlineText(p, "buka", "en")).toMatch(/^Closes /);
    expect(deadlineText(p, "buka", "id")).toMatch(/^Tutup /);
    expect(formatProjectDate(NOW, "WIB", "en")).not.toBe(formatProjectDate(NOW, "WIB", "id"));
    expect(typeof moneyLabel({ idr: 0 }, "en")).toBe("string");
  });

  it("renders payment notifications in English with the English deadline", () => {
    const waiting = registration(slug, { status: "menunggu-pembayaran", registeredAt: NOW });
    const [n] = paymentNotifications([project(slug)], { [slug]: waiting }, NOW + 1000);
    const text = textOf(n, en.messages, "en");
    expect(text).toMatch(/payment/i);
    expect(text).not.toMatch(/menunggu/);
  });
});
