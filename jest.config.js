module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}", // Exclude test files
    "!src/index.js", // Exclude entry point
    "!src/setupTests.js", // Exclude setup file
    "!src/reportWebVitals.js", // Exclude utility files
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text", "lcov"],
  testEnvironment: "jsdom", // Simulate a browser environment
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"], // Test setup files
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest", // Transform JS/JSX files using Babel
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(react-scripts)/)", // Transform dependencies used by react-scripts
  ],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy", // Mock CSS imports
    "\\.(svg|png|jpg|jpeg|gif)$": "<rootDir>/__mocks__/fileMock.js", // Mock file imports
  },
};
