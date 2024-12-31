
// cypress/integration/multiUserLichessFlows.spec.js

describe('Multi-User Lichess Pairing Flow', () => {
  const timestamp = Date.now();

  // Define Test Users
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

  // Admin user (fixed credentials)
  const adminUser = {
    username: Cypress.env('INITIAL_ADMIN_USERNAME'), // "testadmin"
    email: Cypress.env('INITIAL_ADMIN_EMAIL'),       // "testadmin@example.com"
    password: Cypress.env('INITIAL_ADMIN_PASSWORD'), // "TestAdminPass123!"
  };

  // Amount to bet
  const betAmount = 100;

  // Function to mock Lichess endpoints
  const mockLichessFlow = (connected = false) => {
    cy.mockLichess(connected);
  };

  before(() => {
    // 1) Reset the database and reseed admin
    cy.resetDatabaseAndSeedAdmin();

    // 2) Log in as admin after reset
    cy.loginAsAdmin().then(() => {
      cy.log('Admin logged in successfully.');
    });

    // 3) Register user A & user B via UI
    cy.registerUser(userA.username, userA.email, userA.password);
    cy.registerUser(userB.username, userB.email, userB.password);
  });

  context('User A - Registration, Login, Connect Lichess', () => {
    it('Logs in User A and connects to Lichess', () => {
      // 1) Log in User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 2) Mock necessary Lichess endpoints as disconnected
      mockLichessFlow(false);

      // 3) Mock window.open to prevent actual OAuth redirect
      cy.mockWindowOpen();

      // 4) Visit profile to trigger GET /lichess/status
      cy.visit('/profile');

      // 5) Wait for 'GET /lichess/status' to be called with connected: false
      cy.wait('@mockLichessStatus').its('response.statusCode').should('eq', 200);

      // 6) Ensure 'Connect Lichess' button is visible
      cy.get('button').contains('Connect Lichess').should('be.visible').click();

      // 7) Wait for the mocked Lichess callback
      cy.wait('@mockLichessCallback');

      // 8) Verify that window.open was called (OAuth redirect)
      cy.get('@windowOpen').should('be.called');

      // 9) After connecting, mock Lichess status as connected
      mockLichessFlow(true);

      // 10) Visit profile again to trigger GET /lichess/status
      cy.visit('/profile');

      // 11) Wait for 'GET /lichess/status' to be called with connected: true
      cy.wait('@mockLichessStatus').its('response.body.connected').should('eq', true);

      // 12) Verify Lichess connected
      cy.contains('Lichess Connected').should('be.visible');
      cy.contains('testLichessUser').should('be.visible');
    });
  });

  context('User B - Registration, Login, Connect Lichess', () => {
    it('Logs in User B and connects to Lichess', () => {
      // 1) Log out from User A
      cy.logout();

      // 2) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 3) Mock necessary Lichess endpoints as disconnected
      mockLichessFlow(false);

      // 4) Mock window.open to prevent actual OAuth redirect
      cy.mockWindowOpen();

      // 5) Visit profile to trigger GET /lichess/status
      cy.visit('/profile');

      // 6) Wait for 'GET /lichess/status' to be called with connected: false
      cy.wait('@mockLichessStatus').its('response.statusCode').should('eq', 200);

      // 7) Ensure 'Connect Lichess' button is visible
      cy.get('button').contains('Connect Lichess').should('be.visible').click();

      // 8) Wait for the mocked Lichess callback
      cy.wait('@mockLichessCallback');

      // 9) Verify that window.open was called (OAuth redirect)
      cy.get('@windowOpen').should('be.called');

      // 10) After connecting, mock Lichess status as connected
      mockLichessFlow(true);

      // 11) Visit profile again to trigger GET /lichess/status
      cy.visit('/profile');

      // 12) Wait for 'GET /lichess/status' to be called with connected: true
      cy.wait('@mockLichessStatus').its('response.body.connected').should('eq', true);

      // 13) Verify Lichess connected
      cy.contains('Lichess Connected').should('be.visible');
      cy.contains('testLichessUser').should('be.visible');
    });
  });

  context('Bet Creation & Acceptance Flow', () => {
    it('User A places a bet; User B accepts it', () => {
      // 1) Log out from User B
      cy.logout();

      // 2) Log in as User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 3) Place a bet
      cy.visit('/place-bet');
      cy.get('select[name="creatorColor"]').select('White'); // or "random"
      cy.get('input[name="amount"]').type(`${betAmount}`);
      cy.get('button').contains('Place Bet').click();

      // 4) Confirm bet placement
      cy.contains('Bet placed successfully!').should('be.visible');

      // 5) (Optional) Check updated balance on profile
      cy.visit('/profile');
      cy.contains(`${1000 - betAmount} PTK`).should('be.visible'); // Adjust if your default is 1000

      // 6) Log out from User A
      cy.logout();

      // 7) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/available-bets');
      cy.contains('Available Bets').should('be.visible');

      // 8) Locate the newly created bet from User A and accept it
      cy.get('table').within(() => {
        cy.contains(userA.username) // Adjusted to use username instead of email
          .parent('tr')
          .within(() => {
            cy.get('select[name="opponentColor"]').select('Black'); // or "random"
            cy.get('button').contains('Join Bet').click();
          });
      });

      // 9) Confirm acceptance
      cy.contains('Successfully joined the bet!').should('be.visible');

      // 10) (Optional) Check if a game link is available
      // e.g., "Game created at https://lichess.org/abcd1234"
    });
  });

  context('Optional: Admin Validates Game Result', () => {
    it('Admin logs in and processes the final game result', () => {
      // 1) Log out from User B
      cy.logout();

      // 2) Log in as Admin
      cy.loginAsAdmin();
      cy.visit('/admin/dashboard');
      cy.contains('Admin Dashboard').should('be.visible');

      // 3) Navigate to validate result page
      cy.visit('/admin/validate-result');

      // 4) Mock the validate result endpoint
      cy.intercept('POST', '**/lichess/validate-result', {
        statusCode: 200,
        body: {
          gameId: 'abcd1234',
          outcome: 'white_win',
          message: 'Game result processed successfully.',
        },
      }).as('validateResult');

      // 5) Validate the game result
      cy.get('input[name="gameId"]').type('abcd1234');
      cy.get('button').contains('Validate Result').click();

      // 6) Wait for the mocked validate result
      cy.wait('@validateResult');

      // 7) Confirm validation success
      cy.contains('Game result processed successfully.').should('be.visible');

      // 8) (Optional) Check user balances again if the winner got tokens
      // or check status in the DB via an admin endpoint
    });
  });
});

