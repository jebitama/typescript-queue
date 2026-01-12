import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  testEnvironment: 'node',

   // IMPORTANT: only test TS source
  testMatch: ['**/tests/**/*.test.ts'],

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
