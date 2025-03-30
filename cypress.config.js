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
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    env: {
      MOCK_LICHESS: true, // Flag to control mocking behavior
      backendUrl: 'http://localhost:5000', // Add this to make it easier to reference backend
      
      // Add timeout configurations for network operations
      requestTimeout: 10000,
      responseTimeout: 30000,
      
      // Default admin credentials for tests
      INITIAL_ADMIN_EMAIL: 'admin@example.com',
      INITIAL_ADMIN_PASSWORD: 'AdminPass123!',
      INITIAL_ADMIN_USERNAME: 'admin',
    },
    // Configure retries for flaky tests
    retries: {
      runMode: 2, // Retry failed tests in run mode
      openMode: 1, // Retry failed tests in open mode
    },
    // Increase default command timeout
    defaultCommandTimeout: 8000,
    // Increase default timeout for xhr/fetch requests
    requestTimeout: 10000,
    responseTimeout: 30000,
  },
});
