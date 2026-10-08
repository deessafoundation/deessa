module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/errors/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: {
      target: "ES2022", jsx: "react-jsx",
      esModuleInterop: true, isolatedModules: true, rootDir: ".",
    } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.module\\.css$": "<rootDir>/__tests__/errors/style-mock.cjs",
  },
}
