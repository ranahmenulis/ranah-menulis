import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Keep files small and readable. Blank lines and comments do not count.
    rules: {
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      complexity: ["warn", 15],
      "max-depth": ["warn", 4],
    },
  },
  {
    // Tests read top to bottom, so a longer file is fine; src/ keeps 300.
    files: ["tests/**"],
    rules: {
      "max-lines": ["error", { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  // Must stay last: turns off formatting rules that Prettier owns.
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Not part of this repo (see .gitignore): local agent tooling.
    ".agents/**",
    ".claude/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
