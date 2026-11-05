import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Edgework is timer-heavy (session clocks, mocks, sprints). Reading Date.now() and
      // timing refs during render is deliberate there; the React Compiler is not enabled.
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
