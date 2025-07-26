import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import { defineConfig } from "eslint/config";
import prettierPlugin from "eslint-plugin-prettier";

export default defineConfig([
  {
    files: ["jest.config.js", "**/*.config.js", "**/*.cjs"],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: "latest",
      sourceType: "script",
    },
    rules: {
      "no-undef": "off",
    },
  },

  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      js,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-param-reassign": "error",
      "prefer-const": "error",
      "no-else-return": "error",
      "one-var": ["error", "never"],
      "no-unused-expressions": "error",
    },
  },

  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"],
        tsconfigRootDir: process.cwd(),
      },
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/prefer-enum-initializers": "error",

      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  {
    files: ["**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: false,
          bracketSpacing: true,
          arrowParens: "always",
        },
      ],
    },
  },
]);