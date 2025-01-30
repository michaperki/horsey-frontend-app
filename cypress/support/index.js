// cypress/support/index.js

import './commands';

if (Cypress.env('MOCK_LICHESS')) {
  beforeEach(() => {
    cy.mockLichessFlowForUser('userA', true);
    cy.mockLichessFlowForUser('userB', true);
  });
}

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
