import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    // jsdom dipakai untuk semua tes; cukup untuk logika murni dan komponen.
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    // The first jsdom test in a cold run can take several seconds (transform + environment).
    testTimeout: 15_000,
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts"],
      reporter: ["text-summary", "html"],
    },
  },
});
