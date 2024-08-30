import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"], // Ensure this matches your test files
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testTimeout: 5000, // Adjust the timeout for async operations if necessary
  rootDir: "tests",
  globalSetup: "./jest.setup.ts",
  globalTeardown: "./jest.globalTeardown.ts",
};

export default config;
