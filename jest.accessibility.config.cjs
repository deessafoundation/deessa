module.exports = {
 testEnvironment: 'node',
 testMatch: ['<rootDir>/__tests__/accessibility/**/*.test.ts'],
 // jsdom's current dependencies include ESM JavaScript; exercise the real parser in Jest.
 transform: { '^.+\\.[cm]?[jt]sx?$': ['ts-jest', { tsconfig: { target: 'ES2022', allowJs: true, esModuleInterop: true, isolatedModules: true, rootDir: '.' } }] },
 transformIgnorePatterns: [],
 moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
}
