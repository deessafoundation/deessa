/** @type {import('jest').Config} */
const config = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',
  
  // Root directory for tests
  roots: ['<rootDir>/__tests__'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  
  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        // Explicit rootDir: jest's `roots` points at __tests__, so TS otherwise
        // infers the common source dir as ./__tests__ and fails with TS5011
        // once tests import from ../lib.
        rootDir: '.',
      },
    }],
  },
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'lib/payments/**/*.ts',
    'lib/receipts/**/*.ts',
    '!lib/payments/**/*.d.ts',
    '!lib/payments/**/*.example.ts',
    '!lib/payments/**/*.md',
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    './lib/payments/core/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/dist/',
  ],
  
  // Transform ignore patterns.
  //
  // KNOWN GAP (story-parser tests only — payments/receipts/security suites pass):
  // `import('jsdom')` fails with "Unexpected token 'export'" because
  // jsdom -> html-encoding-sniffer -> @exodus/bytes/encoding-lite.js is ESM.
  // Two things block it:
  //   1. `transform` above only maps `^.+\.tsx?$`, so ESM .js files in
  //      node_modules get no transformer at all.
  //   2. This pattern isn't pnpm-aware — the real path is
  //      node_modules/.pnpm/@exodus+bytes@x/node_modules/@exodus/bytes/...
  //      so the exception below never matches.
  // Fixing it needs babel-jest wired up for .js plus a pnpm-aware pattern.
  // jsdom itself is CommonJS and deliberately not listed here.
  transformIgnorePatterns: [
    'node_modules/(?!(@exodus/bytes|html-encoding-sniffer)/)',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Verbose output
  verbose: true,
  
  // Timeout for tests (10 seconds)
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Reset mocks between tests
  resetMocks: true,
}

module.exports = config
