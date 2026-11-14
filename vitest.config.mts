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
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "ranahmenulis"],
  },
});
