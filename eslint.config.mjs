import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks"; // Import the React Hooks plugin
import parser from "@babel/eslint-parser";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      parser,
      parserOptions: {
        requireConfigFile: false, // Do not require a Babel config file
        ecmaVersion: 2021, // Modern ES syntax
        sourceType: "module", // Enable ES Modules
        ecmaFeatures: {
          jsx: true, // Enable JSX
        },
      },
      globals: globals.browser,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      "react-hooks": pluginReactHooks, // Add the React Hooks plugin
    },
    rules: {
      "react/display-name": "warn", // Warn for missing display names
      "react-hooks/rules-of-hooks": "error", // Ensure hooks are used correctly
      "react-hooks/exhaustive-deps": "warn", // Warn for missing dependencies in hooks
    },
  },
];
