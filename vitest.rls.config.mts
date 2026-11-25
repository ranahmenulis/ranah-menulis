import { defineConfig } from "vitest/config";

// RLS tests run against a real Supabase project, so they live in their own config and are not
// part of `npm test` or CI. Run with `npm run test:rls`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rls/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // One file at a time: they share one remote database.
    fileParallelism: false,
  },
});
