module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
    ecmaVersion: 2020, // Thêm dòng này để hỗ trợ cú pháp mới
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // --- CÁC QUY TẮC GỐC ---
    "quotes": ["error", "double"],
    "import/no-unresolved": "off",
    "indent": "off", // Tắt kiểm tra thụt lề
    "eol-last": "off", // Tắt kiểm tra dòng trống cuối file

    // --- TẮT TẤT CẢ CÁC QUY TẮC GÂY LỖI ---
    "max-len": "off",
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "guard-for-in": "off", // Tắt lỗi guard-for-in có thể xuất hiện
    "object-curly-spacing": "off", // Tắt lỗi khoảng trắng trong object
  },
};