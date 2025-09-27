const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  displayName: 'Next.js Testing Framework',
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^@components/(.*)$": "<rootDir>/app/components/$1",
    "^@utils/(.*)$": "<rootDir>/app/utils/$1",
    "^marked$": "<rootDir>/tests/__mocks__/marked.js",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(marked)/)"
  ],
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/types/**",
    "!app/api/**",
    "!**/*.config.js",
    "!**/node_modules/**",
    "!app/debug/**",
    "!app/pages/**",
    "!app/tag/**",
    "!app/property/**"
  ],
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],
  coverageDirectory: "coverage",
  testMatch: [
    "<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}",
    "<rootDir>/tests/**/*.spec.{js,jsx,ts,tsx}"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/"
  ],
  projects: [
    {
      displayName: "jsdom",
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/tests/components/**/*.test.{js,jsx,ts,tsx}",
        "<rootDir>/tests/integration/universal-templates-layout-integration*.test.tsx",
        "<rootDir>/tests/integration/OrganizationSchemaIntegration.test.tsx",
        "<rootDir>/tests/alabaster-tags.test.js"
      ],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/app/$1",
        "^@components/(.*)$": "<rootDir>/app/components/$1",
        "^@utils/(.*)$": "<rootDir>/app/utils/$1",
        "^marked$": "<rootDir>/tests/__mocks__/marked.js",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy"
      },
    },
    {
      displayName: "node",
      testEnvironment: "node", 
      testMatch: [
        "<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}"
      ],
      testPathIgnorePatterns: [
        "<rootDir>/tests/components/",
        "<rootDir>/tests/integration/",
        "<rootDir>/tests/alabaster-tags.test.js"
      ],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/app/$1",
        "^@components/(.*)$": "<rootDir>/app/components/$1",
        "^@utils/(.*)$": "<rootDir>/app/utils/$1",
        "^marked$": "<rootDir>/tests/__mocks__/marked.js",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy"
      },
    }
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 30,
      branches: 25,
      functions: 25,
      lines: 30
    }
  },
  verbose: true,
  maxWorkers: "50%",
  testTimeout: 10000
};

module.exports = createJestConfig(customJestConfig);
