
// cypress/integration/userFlows.spec.js

describe('User Flow Tests', () => {
  const timestamp = Date.now();
  const userA = {
    username: `UserA_${timestamp}`,
    email: `UserA_${timestamp}@test.com`,
    password: 'TestPass123!',
  };
  const userB = {
    username: `UserB_${timestamp}`,
    email: `UserB_${timestamp}@test.com`,
    password: 'TestPass123!',
  };
  const betAmount = 100;

  before(() => {
    // Reset the database and seed admin
    cy.resetDatabaseAndSeedAdmin();

    // Register User A & User B via UI
    cy.registerUser(userA.username, userA.email, userA.password);
    cy.registerUser(userB.username, userB.email, userB.password);
  });

  context('User A - Registration and Login', () => {
    it('Should register and login User A successfully', () => {
      // Already registered in before hook
      cy.visit('/login');
      cy.get('input[name="email"]').type(userA.email);
      cy.get('input[name="password"]').type(userA.password);
      cy.get('button[type="submit"]').click();

      // Verify redirection to home
      cy.url().should('include', '/home');
      cy.contains('Horsey').should('be.visible');
    });
  });

  context('User Flow - Single User Actions', () => {
    beforeEach(() => {
      // Ensure User A is logged in
      cy.logout();
      cy.login(userA.email, userA.password);
      cy.visit('/home');
    });

    it('Should place a bet using the Place Bet modal and appear in "Your Bets"', () => {
      // Click "Place a Bet" button to open the modal
      cy.get('.place-bet-open-button').click();

      // Verify the modal is open
      cy.get('.place-bet-modal').should('be.visible');

      // Fill in the bet details
      cy.get('select#colorPreference').select('White');
      cy.get('input#amount').type(`${betAmount}`);
      cy.get('select#timeControl').select('5|3');
      cy.get('select#variant').select('standard');
      cy.get('select#currencyType').select('token');

      // Place the bet
      cy.get('.place-bet-button').click();

      // Verify success message
      cy.contains('Bet placed successfully!').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button').click();

      // Verify bet appears in "Your Bets"
      cy.visit('/profile');
      cy.contains(userA.username).should('be.visible');
      cy.contains(`${betAmount} PTK`).should('be.visible');
      cy.contains('Pending').should('be.visible');
    });

    it('Should show an error for insufficient balance in the Place Bet modal', () => {
      // Click "Place a Bet" button to open the modal
      cy.get('.place-bet-open-button').click();

      // Verify the modal is open
      cy.get('.place-bet-modal').should('be.visible');

      // Enter an amount exceeding the balance
      cy.get('input#amount').type('999999');

      // Attempt to place the bet
      cy.get('.place-bet-button').click();

      // Verify error message
      cy.contains('Insufficient balance.').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button').click();
    });
  });

  context('Multi-User Betting Flow', () => {
    it('User A places a bet and User B accepts it', () => {
      // User A places a bet
      cy.logout();
      cy.login(userA.email, userA.password);
      cy.visit('/home');
      cy.get('.place-bet-open-button').click();
      cy.get('select#colorPreference').select('Black');
      cy.get('input#amount').type(`${betAmount}`);
      cy.get('select#timeControl').select('10|5');
      cy.get('select#variant').select('standard');
      cy.get('select#currencyType').select('token');
      cy.get('.place-bet-button').click();
      cy.contains('Bet placed successfully!').should('be.visible');
      cy.get('.place-bet-close-button').click();

      // User B accepts the bet
      cy.logout();
      cy.login(userB.email, userB.password);
      cy.visit('/lobby');
      cy.get('table').within(() => {
        cy.contains(userA.username)
          .parent('tr')
          .within(() => {
            cy.get('button').contains('Accept').click();
          });
      });

      // Verify acceptance success
      cy.contains('Successfully joined the bet!').should('be.visible');

      // Verify bet status updates to "Matched"
      cy.visit('/profile');
      cy.get('table').within(() => {
        cy.contains('Matched').should('be.visible');
      });
    });
  });
});

