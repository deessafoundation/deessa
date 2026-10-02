import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

export default [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      "no-duplicate-imports": "warn",
      "prefer-const": "warn",
    },
  },
]
