
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

    cy.mockLichessFlowForUser(userA.id, true);
    cy.mockLichessFlowForUser(userB.id, true);
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.logout(); // Ensure the user is logged out
  });

  context('User A - Login', () => {
    it('Should log in User A successfully after registering', () => {
      cy.login(userA.email, userA.password);

      // Wait for redirection to /home
      cy.url({ timeout: 10000 }).should('include', '/home');

      // Wait for the home container to be visible
      cy.get('.home-container', { timeout: 10000 }).should('be.visible');

      // Verify that the app name or a key element is visible on the home page
      cy.contains('Horsey').should('be.visible');

      // Wait for the Lichess status request and verify the response
      cy.wait('@mockLichessStatus_userA', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.connected).to.be.true;
      });

      // Wait for the Lichess user request and verify the response
      cy.wait('@mockLichessUser_userA', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.username).to.eq('testLichessUser_userA');
      });
    });
  });

  context('User B - Login', () => {
    it('Should log in User B successfully after registering', () => {
      // Removed the redundant cy.visit('/login');
      cy.login(userB.email, userB.password);

      // Verify redirection to home
      cy.url().should('include', '/home');
      cy.contains('Horsey').should('be.visible');

      // Verify Lichess is connected for User B
      cy.wait('@mockLichessStatus_userB');
      cy.wait('@mockLichessUser_userB');
    });
  });

  context('User Flow - Single User Actions', () => {
    beforeEach(() => {
      // Log in User A before each test
      cy.logout();
      cy.login(userA.email, userA.password);
      cy.visit('/home');

      // Wait for Lichess mock
      cy.wait('@mockLichessStatus_userA');
      cy.wait('@mockLichessUser_userA');
    });

    it('Should place a bet and appear in "Your Bets"', () => {
      cy.get('.place-bet-open-button').click();
      cy.get('.place-bet-modal').should('be.visible');
      cy.get('select#colorPreference').select('White');
      cy.get('input#amount').type(`${betAmount}`);
      cy.get('select#timeControl').select('5|3');
      cy.get('select#variant').select('standard');
      cy.get('select#currencyType').select('token');

      cy.get('.place-bet-button').click();
      cy.contains('Bet placed successfully!').should('be.visible');
      cy.get('.place-bet-close-button').click();

      cy.visit('/profile');
      cy.contains(userA.username).should('be.visible');
      cy.contains(`${betAmount} PTK`).should('be.visible');
      cy.contains('Pending').should('be.visible');
    });

    it('Should show an error for insufficient balance', () => {
      cy.get('.place-bet-open-button').click();
      cy.get('.place-bet-modal').should('be.visible');

      cy.get('input#amount').type('999999');
      cy.get('.place-bet-button').click();
      cy.contains('Insufficient balance.').should('be.visible');
      cy.get('.place-bet-close-button').click();
    });
  });

  context('Multi-User Betting Flow', () => {
    it('User A places a bet and User B accepts it', () => {
      // User A places a bet
      cy.logout();
      cy.login(userA.email, userA.password);
      cy.visit('/home');
      cy.wait('@mockLichessStatus_userA');
      cy.wait('@mockLichessUser_userA');

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
      cy.wait('@mockLichessStatus_userB');
      cy.wait('@mockLichessUser_userB');

      cy.get('table').within(() => {
        cy.contains(userA.username)
          .parent('tr')
          .within(() => {
            cy.get('button').contains('Accept').click();
          });
      });
      cy.contains('Successfully joined the bet!').should('be.visible');

      // Verify bet status is "Matched"
      cy.visit('/profile');
      cy.get('table').within(() => {
        cy.contains('Matched').should('be.visible');
      });
    });
  });
});

