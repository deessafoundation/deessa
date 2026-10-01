module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/programs/*.test.tsx'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', esModuleInterop: true, isolatedModules: true, rootDir: '.' } }] },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1', '\\.module\\.css$': '<rootDir>/__tests__/programs/style-mock.cjs' },
}
