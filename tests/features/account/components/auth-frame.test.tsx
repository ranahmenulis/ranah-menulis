import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pathname = vi.hoisted(() => ({ value: "/masuk" }));
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.value,
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { AuthFrame, AuthPage } from "@/features/account/components/auth-frame";

afterEach(cleanup);

describe("AuthFrame", () => {
  it("puts the welcome paper beside sign in, decorative and out of the reading order", () => {
    pathname.value = "/masuk";
    const { container } = render(
      <AuthFrame>
        <p>formulir</p>
      </AuthFrame>,
    );
    const plates = container.querySelectorAll("[data-auth-art]");
    expect([...plates].map((p) => p.getAttribute("data-auth-art"))).toEqual(["welcome", "welcome"]);
    plates.forEach((p) => expect(p.getAttribute("aria-hidden")).toBe("true"));
    container.querySelectorAll("[data-auth-art] img").forEach((img) => {
      expect(img.getAttribute("alt")).toBe("");
    });
    expect(screen.getByText("formulir")).toBeTruthy();
  });

  it("uses the other paper while recovering an account", () => {
    pathname.value = "/lupa-sandi";
    const { container } = render(
      <AuthFrame>
        <p>formulir</p>
      </AuthFrame>,
    );
    expect(container.querySelector("[data-auth-art]")?.getAttribute("data-auth-art")).toBe(
      "recover",
    );
  });
});

describe("AuthPage", () => {
  it("keeps the title as the only heading and celebrates only when asked", () => {
    const { container, rerender } = render(
      <AuthPage title="Email terverifikasi">
        <p>isi</p>
      </AuthPage>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Email terverifikasi" })).toBeTruthy();
    expect(container.querySelector("[data-celebrate]")).toBeNull();
    rerender(
      <AuthPage title="Email terverifikasi" celebrate>
        <p>isi</p>
      </AuthPage>,
    );
    expect(container.querySelector("[data-celebrate]")?.getAttribute("aria-hidden")).toBe("true");
  });
});
