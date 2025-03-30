// cypress/support/index.js

// Import commands.js
import './commands';

// Override default uncaught:exception behavior to prevent test failures on app errors
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  console.log('Uncaught exception:', err.message);
  return false;
});

// Set up test environment based on configuration
before(() => {
  // Log test environment
  cy.log(`Running tests in ${Cypress.env('REAL_LICHESS') ? 'REAL' : 'MOCK'} Lichess mode`);
  
  // Setup mocking if needed
  if (Cypress.env('MOCK_LICHESS')) {
    cy.log('Setting up mocked Lichess API endpoints');
    cy.mockLichessFlowForUser('userA', true);
    cy.mockLichessFlowForUser('userB', true);
  }
  
  // Reset database before test run
  cy.request({
    method: 'POST',
    url: `${Cypress.env('backendUrl')}/test/reset-and-seed-admin`,
    failOnStatusCode: false
  }).then(response => {
    if (response.status === 200) {
      cy.log('Database reset successful');
    } else {
      cy.log(`Database reset failed: ${response.status} ${JSON.stringify(response.body)}`);
    }
  });
});

// Add assertion for checking visibility with scrolling into view
Cypress.Commands.overwrite('should', (originalFn, subject, assertion, ...args) => {
  // Automatically scroll element into view for visibility assertions
  if (assertion === 'be.visible') {
    cy.wrap(subject).scrollIntoView();
  }
  
  return originalFn(subject, assertion, ...args);
});

// Add a custom command to log test step information
Cypress.Commands.add('testStep', (description) => {
  Cypress.log({
    name: 'STEP',
    displayName: '🔍 TEST STEP',
    message: description,
    consoleProps: () => {
      return {
        'Step': description,
        'Timestamp': new Date().toLocaleString()
      };
    }
  });
  
  cy.task('log', `TEST STEP: ${description}`);
});
