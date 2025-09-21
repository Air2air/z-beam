module.exports = {
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": [
    "<rootDir>/tests/setup.js"
  ],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^@/tests/(.*)$": "<rootDir>/tests/$1"
  },
  "collectCoverageFrom": [
    "app/**/*.{js,ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/index.{js,ts}",
    "!app/**/*.stories.{js,ts,tsx}"
  ],
  "coverageReporters": [
    "text",
    "html",
    "json-summary"
  ],
  "testMatch": [
    "<rootDir>/tests/**/*.{test,spec}.{js,ts,tsx}"
  ],
  "transform": {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        "presets": [
          "next/babel"
        ]
      }
    ]
  },
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json"
  ],
  "testTimeout": 10000,
  "maxWorkers": "50%",
  "cache": true,
  "cacheDirectory": "<rootDir>/.jest-cache"
};