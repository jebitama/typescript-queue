import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json'
      }
    ]
  },

   // IMPORTANT: only test TS source
  testMatch: ['**/tests/**/*.test.ts'],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.test.ts',
    '!dist/**',
    '!node_modules/**',
    '!main.ts',
    '!service-no-recursive.ts',
    '!jest.config.ts'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
