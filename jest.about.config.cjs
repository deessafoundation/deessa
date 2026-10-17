const base = require("./jest.config.js")
module.exports = {
  ...base,
  testMatch: ["<rootDir>/__tests__/about/*.test.ts", "<rootDir>/__tests__/about/*.test.tsx"],
  transform: { "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx", esModuleInterop: true, rootDir: "." } }] },
  moduleNameMapper: { ...base.moduleNameMapper, "\\.module\\.css$": "<rootDir>/__tests__/programs/style-mock.cjs" },
}
