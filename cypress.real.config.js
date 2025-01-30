
// cypress.real.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Same as default
    specPattern: 'cypress/integration/real/**/*.spec.js', // Separate spec folder
    supportFile: 'cypress/support/index.js', // Shared support file
    fixturesFolder: 'cypress/fixtures',
    setupNodeEvents(on, config) {
      // Implement node event listeners here if needed
    },
    env: {
      MOCK_LICHESS: false, // Disable mocking
      REAL_LICHESS: true,  // Custom flag for real tests
    },
  },
});
