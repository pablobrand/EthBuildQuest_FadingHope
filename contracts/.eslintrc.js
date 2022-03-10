module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "standard",
    "plugin:prettier/recommended",
    "plugin:node/recommended",
    "eslint:recommended",
    "plugin:eslint-comments/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "plugin:functional/lite",
    "prettier",
    "prettier/@typescript-eslint"
  ],
  "globals": { "BigInt": true, "console": true, "WebAssembly": true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "eslint-comments/disable-enable-pair": [
      "error",
      { "allowWholeFile": true }
    ],
    "eslint-comments/no-unused-disable": "error",
    "import/order": [
      "error",
      { "newlines-between": "always", "alphabetize": { "order": "asc" } }
    ],
    "sort-imports": [
      "error",
      { "ignoreDeclarationSort": true, "ignoreCase": true }
    ]
  },
};
