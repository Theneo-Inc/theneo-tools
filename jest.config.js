module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/tests/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
    '!<rootDir>/src/cli.ts',
  ],
  collectCoverage: true,
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
};
