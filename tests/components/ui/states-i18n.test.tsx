import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FeedItemSkeleton, RetryButton } from "@/components/ui/states";
import { ToastProvider } from "@/components/ui/toast";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/provider";

afterEach(cleanup);

function inEnglish(node: React.ReactNode) {
  return render(
    <I18nProvider locale="en" dictionary={dictionaries.en}>
      {node}
    </I18nProvider>,
  );
}

describe("shared states in two languages", () => {
  it("speaks Indonesian without a provider", () => {
    render(<RetryButton />);
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeTruthy();
  });

  it("speaks English inside an English provider", () => {
    inEnglish(
      <>
        <RetryButton />
        <FeedItemSkeleton />
      </>,
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Loading");
  });

  it("names the toast region in the reader's language", () => {
    inEnglish(<ToastProvider>{null}</ToastProvider>);
    expect(screen.getByRole("region", { name: "Notices" })).toBeTruthy();
  });
});
