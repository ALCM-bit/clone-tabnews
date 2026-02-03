import js from "@eslint/js";
import globals from "globals";
import jestPlugin from "eslint-plugin-jest";

export default [
  // 1. Configuração de arquivos a ignorar (Substitui o globalIgnores)
  {
    ignores: [".next/*", "node_modules/*"],
  },

  // 2. Configuração base para JS e Browser
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Essencial para Next.js (SSR)
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  // 3. Configuração específica para JEST
  {
    files: ["**/__tests__/**/*", "**/*.{test,spec}.{js,mjs,cjs,jsx}"],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      "jest/no-disabled-tests": "warn",
      "jest/consistent-test-it": ["error", { fn: "test" }],
    },
  },
];
