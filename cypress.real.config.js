// cypress.real.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Same as default
    specPattern: 'cypress/integration/real/**/*.spec.js', // Separate spec folder
    supportFile: 'cypress/support/index.js', // Shared support file
    fixturesFolder: 'cypress/fixtures',
    setupNodeEvents(on, config) {
      // Implement node event listeners
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
    env: {
      MOCK_LICHESS: false, // Disable mocking for real tests
      REAL_LICHESS: true,  // Flag to indicate we're using real Lichess API
      backendUrl: 'http://localhost:5000',
      
      // These should be loaded from env variables or real-env.json file
      // DO NOT hardcode real credentials here - this is just a placeholder
      authToken_a_email: process.env.LICHESS_TEST_USER_A_EMAIL,
      authToken_a_password: process.env.LICHESS_TEST_USER_A_PASSWORD,
      authToken_a: process.env.LICHESS_TEST_USER_A_TOKEN,
      
      authToken_b_email: process.env.LICHESS_TEST_USER_B_EMAIL,
      authToken_b_password: process.env.LICHESS_TEST_USER_B_PASSWORD,
      authToken_b: process.env.LICHESS_TEST_USER_B_TOKEN,
      
      // Timeout configurations - real tests need longer timeouts
      requestTimeout: 30000,
      responseTimeout: 60000,
    },
    // Configure retries for flaky tests
    retries: {
      runMode: 2, // Retry failed tests twice in run mode
      openMode: 1, // Retry failed tests once in open mode
    },
    // Increase default command timeout for real API tests
    defaultCommandTimeout: 15000,
    // Increase default timeout for xhr/fetch requests
    requestTimeout: 30000,
    responseTimeout: 60000,
  },
});
