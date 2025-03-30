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
    beforeEach(() => {
      // Ensure we start fresh for each test
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('Should login successfully with valid credentials', () => {
      cy.visit('/admin/login');
      
      // Check that the admin login form is properly displayed
      cy.get('.auth-card').should('be.visible');
      cy.get('.auth-subtitle').contains('Admin Login').should('be.visible');
      
      // Fill in credentials
      cy.get('input[name="email"]').type(adminUser.email);
      cy.get('input[name="password"]').type(adminUser.password);
      cy.get('button[type="submit"]').click();

      // Verify redirection to admin dashboard
      cy.url().should('include', '/admin/dashboard', { timeout: 10000 });
      cy.contains('Admin Dashboard').should('be.visible');
    });

    it('Should show error with invalid credentials', () => {
      cy.visit('/admin/login');
      cy.get('input[name="email"]').type(adminUser.email);
      cy.get('input[name="password"]').type('WrongPassword!');
      cy.get('button[type="submit"]').click();
      
      // Verify error message - updated to match new error component format
      cy.get('.api-error').should('be.visible');
      cy.get('.api-error').contains('Invalid credentials').should('be.visible');
    });
  });

  context('Admin Actions', () => {
    beforeEach(() => {
      // Ensure admin is logged in before each admin action test
      cy.loginAsAdmin();
      cy.visit('/admin/dashboard');
      cy.contains('Admin Dashboard').should('be.visible');
    });

    it('Should access the admin dashboard with proper navigation', () => {
      // Test navigation elements and basic dashboard functionality
      cy.get('h2').contains('Admin Dashboard').should('be.visible');
      
      // Verify logout button is available
      cy.get('button').contains('Logout').should('be.visible');
    });

    // Additional admin action tests can be uncommented and updated when ready
    /* 
    it('Should mint tokens successfully and update balance', () => {
      const mintAmount = 500;

      cy.visit('/admin/mint');
      cy.get('input[name="amount"]').type(mintAmount.toString());
      cy.get('button').contains('Mint Tokens').click();

      // Verify success message - updated to new notification component
      cy.get('.notifications-container').contains('Tokens minted successfully').should('be.visible');

      // Verify updated balance
      cy.visit('/admin/balance');
      cy.contains(`Balance: ${mintAmount}`).should('be.visible');
    });
    */
    
    /* 
    it('Should transfer tokens between addresses', () => {
      const transferAmount = 200;
      const recipientEmail = 'recipient@example.com';

      // First, ensure recipient exists by creating if needed
      cy.request({
        method: 'POST',
        url: `${Cypress.env('backendUrl')}/test/create-user-if-not-exists`,
        body: {
          email: recipientEmail,
          username: 'TestRecipient',
          password: 'Password123!'
        }
      });

      cy.visit('/admin/transfer');
      cy.get('input[name="recipientEmail"]').type(recipientEmail);
      cy.get('input[name="amount"]').type(transferAmount.toString());
      cy.get('button').contains('Transfer Tokens').click();

      // Verify success message using the new ApiError component
      cy.get('.success-message').contains('Tokens transferred successfully').should('be.visible');
    });
    */
  });
  
  // Test admin logout functionality
  context('Admin Logout', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.visit('/admin/dashboard');
    });
    
    it('Should successfully log out admin user', () => {
      // Click logout button
      cy.get('button').contains('Logout').click();
      
      // Verify redirect to home page 
      cy.url().should('include', '/');
      
      // Verify admin can't access dashboard after logout
      cy.visit('/admin/dashboard');
      cy.url().should('include', '/login'); // Should redirect to login
    });
  });
});
