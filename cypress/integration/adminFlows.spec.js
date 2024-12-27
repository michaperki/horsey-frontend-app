
// cypress/integration/adminFlows.spec.js

describe('Admin Flows', () => {
  const adminEmail = Cypress.env('adminEmail');
  const adminPassword = Cypress.env('adminPassword');
  const adminAddress = Cypress.env('adminAddress');

  beforeEach(() => {
    cy.loginAsAdmin().then(() => {
      cy.setAuthToken();
    });
  });

  it('Logs in as admin, mints tokens, validates game results', () => {
    // Navigate to mint tokens page
    cy.visit('/admin/mint', {
      onBeforeLoad: (win) => {
        const token = Cypress.env('authToken');
        win.localStorage.setItem('token', token);
      },
    });

    // Mint tokens
    cy.get('input[name=toAddress]').type(adminAddress);
    cy.get('input[name=amount]').type('1');
    cy.get('button[type=submit]').click();

    // Wait for the success message or transaction hash
    cy.contains('Success! Transaction Hash:', { timeout: 15000 }).should('be.visible');

    // Validate game results
    cy.visit('/admin/validate-result', {
      onBeforeLoad: (win) => {
        const token = Cypress.env('authToken');
        win.localStorage.setItem('token', token);
      },
    });

    cy.get('input[name=gameId]').type('nuOCvs7w');
    cy.get('button[type=submit]').click();
    cy.contains('Processed bets for game game123', { timeout: 10000 }).should('be.visible');
  });
});

