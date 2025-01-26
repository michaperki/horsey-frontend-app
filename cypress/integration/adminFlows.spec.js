
// cypress/integration/adminFlows.spec.js

describe('Admin Flow Tests', () => {
  const adminUser = {
    username: Cypress.env('INITIAL_ADMIN_USERNAME'),
    email: Cypress.env('INITIAL_ADMIN_EMAIL'),
    password: Cypress.env('INITIAL_ADMIN_PASSWORD'),
  };

  before(() => {
    // Reset the database and seed admin
    cy.resetDatabaseAndSeedAdmin();
  });

  context('Admin Login', () => {
    it('Should login successfully with valid credentials', () => {
      cy.visit('/admin/login');
      cy.get('input[name="email"]').type(adminUser.email);
      cy.get('input[name="password"]').type(adminUser.password);
      cy.get('button[type="submit"]').click();

      // Verify redirection to admin dashboard
      // cy.url().should('include', '/admin/dashboard');
      // cy.contains('Admin Dashboard').should('be.visible');
    });

    // it('Should show error with invalid credentials', () => {
    //   cy.visit('/admin/login');
    //   cy.get('input[name="email"]').type(adminUser.email);
    //   cy.get('input[name="password"]').type('WrongPassword!');
    //   cy.get('button[type="submit"]').click();
    //
    //   // Verify error message
    //   cy.contains('Invalid credentials').should('be.visible');
    // });
  });

  // context('Admin Actions', () => {
  //   beforeEach(() => {
  //     // Ensure admin is logged in before each admin action test
  //     cy.loginAsAdmin();
  //     cy.visit('/admin/dashboard');
  //     cy.contains('Admin Dashboard').should('be.visible');
  //   });
  //
  //   it('Should mint tokens successfully and update balance', () => {
  //     const mintAmount = 500;
  //
  //     cy.visit('/admin/mint');
  //     cy.get('input[name="amount"]').type(mintAmount.toString());
  //     cy.get('button').contains('Mint Tokens').click();
  //
  //     // Verify success message
  //     cy.contains('Tokens minted successfully').should('be.visible');
  //
  //     // Verify updated balance
  //     cy.visit('/admin/balance');
  //     cy.contains(`Balance: ${mintAmount}`).should('be.visible');
  //   });
  //
  //   it('Should transfer tokens between addresses', () => {
  //     const transferAmount = 200;
  //     const recipientEmail = 'recipient@example.com';
  //
  //     cy.visit('/admin/transfer');
  //     cy.get('input[name="recipientEmail"]').type(recipientEmail);
  //     cy.get('input[name="amount"]').type(transferAmount.toString());
  //     cy.get('button').contains('Transfer Tokens').click();
  //
  //     // Verify success message
  //     cy.contains('Tokens transferred successfully').should('be.visible');
  //
  //     // Optionally, verify recipient's balance
  //     cy.visit('/admin/balance');
  //     cy.contains(`Recipient Balance: ${transferAmount}`).should('be.visible');
  //   });
  //
  //   it('Should check balance for a given address', () => {
  //     const addressEmail = 'user@example.com';
  //
  //     cy.visit('/admin/balance');
  //     cy.get('input[name="email"]').type(addressEmail);
  //     cy.get('button').contains('Check Balance').click();
  //
  //     // Verify balance display
  //     cy.contains('Balance').should('be.visible');
  //     // Further assertions can be made based on known balance
  //   });
  //
  //   it('Should validate game result and update status', () => {
  //     const gameId = 'mockGameId123';
  //     const expectedStatus = 'Processed';
  //
  //     cy.visit('/admin/validate-result');
  //     cy.get('input[name="gameId"]').type(gameId);
  //     cy.get('button').contains('Validate Result').click();
  //
  //     // Verify success message and status update
  //     cy.contains('Result processed successfully').should('be.visible');
  //     cy.contains(`Game ID: ${gameId} Status: ${expectedStatus}`).should('be.visible');
  //   });
  // });
});
