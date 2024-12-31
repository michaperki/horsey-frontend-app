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

  // Admin user
  const adminUser = {
    username: `Admin_${timestamp}`,
    email: `Admin_${timestamp}@test.com`,
    password: 'AdminPass123!',
  };

  // Amount to bet
  const betAmount = 100;

  // Function to mock Lichess endpoints
  const mockLichessFlow = (connected = false) => {
    cy.mockLichess(connected);
  };

  before(() => {
    // 1) Set admin credentials in Cypress.env
    Cypress.env('adminEmail', adminUser.email);
    Cypress.env('adminPassword', adminUser.password);

    // 2) Register admin user
    cy.registerAdmin(adminUser.username, adminUser.email, adminUser.password);

    // 3) Log in as admin
    cy.loginAsAdmin();

    // 4) Reset the database
    cy.resetDatabase();

    // 5) Re-register admin user after reset
    cy.registerAdmin(adminUser.username, adminUser.email, adminUser.password);

    // 6) Re-login as admin after reset
    cy.loginAsAdmin();

    // 7) Register user A & user B via UI
    cy.registerUser(userA.username, userA.email, userA.password);
    cy.registerUser(userB.username, userB.email, userB.password);
  });

  context('User A - Registration, Login, Connect Lichess', () => {
    it('Logs in User A and connects to Lichess', () => {
      // 8) Log in User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 9) Mock necessary Lichess endpoints as disconnected
      mockLichessFlow(false);

      // 10) Visit profile to trigger GET /lichess/status
      cy.visit('/profile');

      // 11) Wait for 'GET /lichess/status' to be called with connected: false
      cy.wait('@mockLichessStatus').its('response.statusCode').should('eq', 200);

      // 12) Ensure 'Connect Lichess' button is visible
      cy.get('button').contains('Connect Lichess').should('be.visible').click();

      // 13) Wait for the mocked Lichess callback
      cy.wait('@mockLichessCallback');

      // 14) Verify that window.open was called (OAuth redirect)
      cy.get('@windowOpen').should('be.called');

      // 15) After connecting, mock Lichess status as connected
      mockLichessFlow(true);

      // 16) Visit profile again to trigger GET /lichess/status
      cy.visit('/profile');

      // 17) Wait for 'GET /lichess/status' to be called with connected: true
      cy.wait('@mockLichessStatus').its('response.body.connected').should('eq', true);

      // 18) Verify Lichess connected
      cy.contains('Lichess Connected').should('be.visible');
      cy.contains('testLichessUser').should('be.visible');
    });
  });

  context('User B - Registration, Login, Connect Lichess', () => {
    it('Logs in User B and connects to Lichess', () => {
      // 19) Log out from User A
      cy.logout();

      // 20) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 21) Mock necessary Lichess endpoints as disconnected
      mockLichessFlow(false);

      // 22) Visit profile to trigger GET /lichess/status
      cy.visit('/profile');

      // 23) Wait for 'GET /lichess/status' to be called with connected: false
      cy.wait('@mockLichessStatus').its('response.statusCode').should('eq', 200);

      // 24) Ensure 'Connect Lichess' button is visible
      cy.get('button').contains('Connect Lichess').should('be.visible').click();

      // 25) Wait for the mocked Lichess callback
      cy.wait('@mockLichessCallback');

      // 26) Verify that window.open was called (OAuth redirect)
      cy.get('@windowOpen').should('be.called');

      // 27) After connecting, mock Lichess status as connected
      mockLichessFlow(true);

      // 28) Visit profile again to trigger GET /lichess/status
      cy.visit('/profile');

      // 29) Wait for 'GET /lichess/status' to be called with connected: true
      cy.wait('@mockLichessStatus').its('response.body.connected').should('eq', true);

      // 30) Verify Lichess connected
      cy.contains('Lichess Connected').should('be.visible');
      cy.contains('testLichessUser').should('be.visible');
    });
  });

  context('Bet Creation & Acceptance Flow', () => {
    it('User A places a bet; User B accepts it', () => {
      // 31) Log out from User B
      cy.logout();

      // 32) Log in as User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 33) Place a bet
      cy.visit('/place-bet');
      cy.get('select[name="creatorColor"]').select('White'); // or "random"
      cy.get('input[name="amount"]').type(`${betAmount}`);
      cy.get('button').contains('Place Bet').click();

      // 34) Confirm bet placement
      cy.contains('Bet placed successfully!').should('be.visible');

      // 35) (Optional) Check updated balance on profile
      cy.visit('/profile');
      cy.contains(`${1000 - betAmount} PTK`).should('be.visible'); // Adjust if your default is 1000

      // 36) Log out from User A
      cy.logout();

      // 37) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/available-bets');
      cy.contains('Available Bets').should('be.visible');

      // 38) Locate the newly created bet from User A and accept it
      cy.get('table').within(() => {
        cy.contains(userA.username) // Adjusted to use username instead of email
          .parent('tr')
          .within(() => {
            cy.get('select[name="opponentColor"]').select('Black'); // or "random"
            cy.get('button').contains('Join Bet').click();
          });
      });

      // 39) Confirm acceptance
      cy.contains('Successfully joined the bet!').should('be.visible');

      // 40) (Optional) Check if a game link is available
      // e.g., "Game created at https://lichess.org/abcd1234"
    });
  });

  context('Optional: Admin Validates Game Result', () => {
    it('Admin logs in and processes the final game result', () => {
      // 41) Log out from User B
      cy.logout();

      // 42) Log in as Admin
      cy.loginAsAdmin();
      cy.visit('/admin/dashboard');
      cy.contains('Admin Dashboard').should('be.visible');

      // 43) Navigate to validate result page
      cy.visit('/admin/validate-result');

      // 44) Mock the validate result endpoint
      cy.intercept('POST', '/lichess/validate-result', {
        statusCode: 200,
        body: {
          gameId: 'abcd1234',
          outcome: 'white_win',
          message: 'Game result processed successfully.',
        },
      }).as('validateResult');

      // 45) Validate the game result
      cy.get('input[name="gameId"]').type('abcd1234');
      cy.get('button').contains('Validate Result').click();

      // 46) Wait for the mocked validate result
      cy.wait('@validateResult');

      // 47) Confirm validation success
      cy.contains('Game result processed successfully.').should('be.visible');

      // 48) (Optional) Check user balances again if the winner got tokens
      // or check status in the DB via an admin endpoint
    });
  });
});
