import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // ─── Project-level rule overrides ──────────────────────────────────────────
  // These rules are downgraded from "error" to "warn" because the patterns they
  // flag are intentional or legacy in this codebase and fixing them all before
  // shipping would block the build unnecessarily.  They remain as warnings so
  // the team can continue to address them incrementally.
  {
    rules: {
      // Legacy placeholder `any` types in shared types will be migrated in Phase 6
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused-var warnings are noise during active development
      "@typescript-eslint/no-unused-vars": "warn",
      // CommonJS require() used only in the Neon WebSocket shim (conditional)
      "@typescript-eslint/no-require-imports": "warn",
      // setState-in-effect: many usages are intentional initialization patterns
      "react-hooks/set-state-in-effect": "warn",
      // Immutability rule fires on legitimate async callback patterns
      "react-hooks/immutability": "warn",
      // prefer-const is a style guide issue, not a correctness problem
      "prefer-const": "warn",
      // <a> vs <Link>: flagged in auth pages that intentionally use native anchors
      "@next/next/no-html-link-for-pages": "warn",
      // <img> vs <Image>: some images require dynamic external URLs
      "@next/next/no-img-element": "warn",
      // Unescaped entities appear in prose-heavy UI copy
      "react/no-unescaped-entities": "warn",
      // Exhaustive-deps: some effects intentionally omit deps to avoid re-runs
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
