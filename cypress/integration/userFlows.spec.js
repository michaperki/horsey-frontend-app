// cypress/integration/userFlows.spec.js

describe('User Flow Tests', () => {
  const timestamp = Date.now();
  const userA = {
    id: 'userA',
    username: `UserA_${timestamp}`,
    email: `UserA_${timestamp}@test.com`,
    password: 'TestPass123!',
  };
  const userB = {
    id: 'userB',
    username: `UserB_${timestamp}`,
    email: `UserB_${timestamp}@test.com`,
    password: 'TestPass123!',
  };
  const betAmount = 100;

  before(() => {
    // Reset DB and seed admin
    cy.resetDatabaseAndSeedAdmin();

    // Register both users
    cy.registerUser(userA.username, userA.email, userA.password);
    cy.registerUser(userB.username, userB.email, userB.password);

    // Set Lichess Access Tokens for both users
    cy.setLichessAccessToken(userA.email, Cypress.env('authToken_a'));
    cy.setLichessAccessToken(userB.email, Cypress.env('authToken_b'));
  });

  beforeEach(() => {
    cy.viewport('macbook-15'); // Alternatively, use cy.viewport(width, height);
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.logout(); // Navigates to /login
    cy.mockLichessFlowForUser(userA.id, true); // Set up intercepts before login
    cy.login(userA.email, userA.password); // This navigates to /home

    // Wait for Lichess mock
    cy.wait(`@mockLichessStatus_${userA.id}`);
    cy.wait(`@mockLichessUser_${userA.id}`);
  });

  context('User A - Login', () => {
    it('Should log in User A successfully after registering', () => {
      // Assertions are already handled in beforeEach
      cy.contains('Horsey').should('be.visible');
    });
  });

  context('User Flow - Single User Actions', () => {
    it('Should place a bet and appear in "Your Bets"', () => {
      cy.get('.place-bet-open-button').click();
      cy.get('.place-bet-modal').should('be.visible');

      // **Updated Interactions with Radio Buttons as Tiles**

      // Select Color Preference: White
      cy.contains('label.place-bet-tile', 'White').click();

      // Enter Bet Amount
      cy.get('input#amount').clear().type('100');

      // Select Time Control: 5|3
      cy.contains('label.place-bet-tile', '5|3').click();

      // Select Variant: Standard
      cy.contains('label.place-bet-tile', 'Standard').click();

      // Select Currency Type: Tokens
      cy.contains('label.place-bet-tile', 'Tokens').click();

      // Submit the bet
      cy.get('.place-bet-button').click();

      // Verify success message
      cy.contains('Bet placed successfully!').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button').click();

      // Navigate to Profile and check "Your Bets"
      cy.visit('/profile');

      // Click the "History" tab
      cy.get('.vertical-tabs').contains('History').click();

      // **Updated Selector for Bets Table**

      // Instead of using '.bets-table', target the table with class 'w-full border-collapse mb-md'
      cy.get('table.w-full.border-collapse.mb-md').within(() => {
        cy.contains('td', '100').should('be.visible');
        cy.contains('td', 'Token').should('be.visible');
        cy.contains('td', 'Pending').should('be.visible');
      });
    });

    it('Should show an error for insufficient balance', () => {
      cy.get('.place-bet-open-button').click();
      cy.get('.place-bet-modal').should('be.visible');

      // Enter an amount exceeding the balance
      cy.get('input#amount').clear().type('999999');

      // Submit the bet
      cy.get('.place-bet-button').click();

      // Assert that the error message is visible
      cy.contains('Insufficient balance.').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button')
        .should('be.visible') // Ensure the button is visible
        .click();
    });
  });

  context('User B - Login', () => {
    beforeEach(() => {
      cy.logout();
      cy.mockLichessFlowForUser(userB.id, true);
      cy.login(userB.email, userB.password);

      cy.wait(`@mockLichessStatus_${userB.id}`);
      cy.wait(`@mockLichessUser_${userB.id}`);
    });

    it('Should log in User B successfully after registering', () => {
      cy.contains('Horsey').should('be.visible');
    });
  });

  context('Multi-User Betting Flow', () => {
    it('User A places a bet and User B accepts it', () => {
      // User A places a bet
      cy.logout();
      cy.mockLichessFlowForUser(userA.id, true);
      cy.login(userA.email, userA.password);

      cy.wait(`@mockLichessStatus_${userA.id}`);
      cy.wait(`@mockLichessUser_${userA.id}`);

      cy.wait(1000); // Waits for 1 second
      cy.get('.place-bet-open-button').click();
      cy.get('.place-bet-modal').should('be.visible');

      // **Updated Interactions with Radio Buttons as Tiles**

      // Select Color Preference: Black
      cy.contains('label.place-bet-tile', 'Black').click();

      // Enter Bet Amount
      cy.get('input#amount').clear().type(`${betAmount}`);

      // Select Time Control: 3|2
      cy.contains('label.place-bet-tile', '3|2').click();

      // Select Variant: Standard
      cy.contains('label.place-bet-tile', 'Standard').click();

      // Select Currency Type: Tokens
      cy.contains('label.place-bet-tile', 'Tokens').click();

      // Submit the bet
      cy.get('.place-bet-button').click();

      // Verify success message
      cy.contains('Bet placed successfully!').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button').click();

      // User B accepts the bet
      cy.logout();
      cy.mockLichessFlowForUser(userB.id, true);
      cy.login(userB.email, userB.password);

      cy.wait(`@mockLichessStatus_${userB.id}`);
      cy.wait(`@mockLichessUser_${userB.id}`);

      cy.visit('/lobby');

      cy.get('table').within(() => {
        cy.contains(userA.username)
          .parent('tr')
          .within(() => {
            cy.get('button.join-button')
              .should('be.visible') // Ensure the button is present
              .click(); // Click the button with the icon
          });
      });

      // Verify acceptance message
      cy.contains('Bet Accepted', { timeout: 20000 }).should('be.visible');

      // Verify bet status is "Matched"
      cy.visit('/profile');

      // Click the "History" tab
      cy.get('.vertical-tabs').contains('History').click();

      // **Updated Selector for Bets Table**

      cy.get('table.w-full.border-collapse.mb-md').within(() => {
        cy.contains('td', 'Matched').should('be.visible');
      });
    });
  });
});
