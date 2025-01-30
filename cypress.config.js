
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Adjust based on your frontend's local URL
    specPattern: 'cypress/integration/**/*.spec.js',
    supportFile: 'cypress/support/index.js',
    fixturesFolder: 'cypress/fixtures',
    setupNodeEvents(on, config) {
      // Implement node event listeners here if needed
    },
    env: {
      MOCK_LICHESS: true, // Flag to control mocking behavior
    },
  },
});

