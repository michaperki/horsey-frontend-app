// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/index.js",
    "!src/setupTests.js",
    "!src/reportWebVitals.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text", "lcov"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(react-icons|@mui|framer-motion|socket.io-client))/"
  ],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.(svg|png|jpg|jpeg|gif)$": "<rootDir>/__mocks__/fileMock.js",
    "^axios$": "<rootDir>/__mocks__/axios.js",
  },
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
  moduleDirectories: ["node_modules", "src"],
};