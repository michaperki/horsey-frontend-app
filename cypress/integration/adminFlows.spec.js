
// cypress/integration/adminFlows.spec.js

describe('Admin Flows', () => {
  it('Logs in as admin, mints tokens, validates game results', () => {
    // Log in as admin
    cy.visit('/admin/login');
    cy.get('input[name=email]').type('admin@example.com');
    cy.get('input[name=password]').type('adminpass');
    cy.get('button[type=submit]').click();
    cy.contains('Admin login successful');

    // Mint tokens
    cy.visit('/admin/mint-tokens');
    cy.get('input[name=toAddress]').type('0xRecipientAddress');
    cy.get('input[name=amount]').type('100');
    cy.get('button[type=submit]').click();
    cy.contains('Tokens minted successfully');

    // Validate game results
    cy.visit('/admin/validate-game');
    cy.get('input[name=gameId]').type('game123');
    cy.get('button[type=submit]').click();
    cy.contains('Processed bets for game game123');
  });

  it('Ensures admin-only components are hidden from regular users', () => {
    // Log out admin
    cy.get('button.logout').click();

    // Log in as regular user
    cy.visit('/login');
    cy.get('input[name=email]').type('user@example.com');
    cy.get('input[name=password]').type('userpass');
    cy.get('button[type=submit]').click();
    cy.contains('Login successful');

    // Attempt to access admin routes
    cy.visit('/admin/mint-tokens');
    cy.contains('Access denied. Insufficient permissions.');

    cy.visit('/admin/validate-game');
    cy.contains('Access denied. Insufficient permissions.');

    // Ensure admin components are not visible
    cy.get('.admin-panel').should('not.exist');
  });
});
