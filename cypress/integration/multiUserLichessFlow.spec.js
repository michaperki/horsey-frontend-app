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

  // Example function to mock Lichess connect callback if desired
  const mockLichessCallback = () => {
    cy.intercept('POST', '/auth/lichess/callback', {
      statusCode: 200,
      body: {
        lichessHandle: 'testLichessUser',
        connectedAt: new Date().toISOString(),
      },
    }).as('mockLichess');
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

    // 5) Register user A & user B
    cy.registerUser(userA.username, userA.email, userA.password);
    cy.registerUser(userB.username, userB.email, userB.password);
  });

  context('User A - Registration, Login, Connect Lichess', () => {
    it('Logs in User A and connects to Lichess', () => {
      // 6) Log in User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 7) Mock the Lichess callback endpoint
      mockLichessCallback();

      // Go to Profile or Dashboard page, click "Connect Lichess"
      cy.visit('/profile');
      cy.get('button').contains('Connect Lichess').click();
      cy.wait('@mockLichess'); // Wait for the mocked Lichess callback

      // Verify Lichess connected
      cy.contains('Lichess Connected').should('be.visible');
      cy.contains('testLichessUser').should('be.visible');

      // (Optional) Confirm updated UI or state
    });
  });

  context('User B - Registration, Login, Connect Lichess', () => {
    it('Logs in User B and connects to Lichess', () => {
      // 8) Log out from User A
      cy.logout();

      // 9) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 10) Mock the Lichess callback endpoint
      mockLichessCallback();

      // Connect Lichess
      cy.visit('/profile');
      cy.get('button').contains('Connect Lichess').click();
      cy.wait('@mockLichess'); // Wait for the mocked Lichess callback

      // Verify Lichess connected
      cy.contains('Lichess Connected').should('be.visible');
      cy.contains('testLichessUser').should('be.visible');
    });
  });

  context('Bet Creation & Acceptance Flow', () => {
    it('User A places a bet; User B accepts it', () => {
      // 11) Log out from User B
      cy.logout();

      // 12) Log in as User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 13) Place a bet
      cy.visit('/place-bet');
      cy.get('select[name="creatorColor"]').select('White'); // or "random"
      cy.get('input[name="amount"]').type(`${betAmount}`);
      cy.get('button').contains('Place Bet').click();

      // Confirm bet placement
      cy.contains('Bet placed successfully!').should('be.visible');

      // (Optional) Check updated balance on profile
      cy.visit('/profile');
      cy.contains(`${1000 - betAmount} PTK`).should('be.visible'); // Adjust if your default is 1000

      // 14) Log out from User A
      cy.logout();

      // 15) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/available-bets');
      cy.contains('Available Bets').should('be.visible');

      // 16) Locate the newly created bet from User A and accept it
      cy.get('table').within(() => {
        cy.contains(userA.email) // or some unique identifier
          .parent('tr')
          .within(() => {
            cy.get('select[name="opponentColor"]').select('Black'); // or "random"
            cy.get('button').contains('Join Bet').click();
          });
      });

      // Confirm acceptance
      cy.contains('Successfully joined the bet!').should('be.visible');

      // (Optional) Check if a game link is available
      // e.g., "Game created at https://lichess.org/abcd1234"
    });
  });

  context('Optional: Admin Validates Game Result', () => {
    it('Admin logs in and processes the final game result', () => {
      // 17) Log out from User B
      cy.logout();

      // 18) Log in as Admin
      cy.loginAsAdmin();
      cy.visit('/admin/dashboard');
      cy.contains('Admin Dashboard').should('be.visible');

      // 19) Navigate to validate result page
      cy.visit('/admin/validate-result');

      // 20) Mock the validate result endpoint
      cy.intercept('POST', '/lichess/validate-result', {
        statusCode: 200,
        body: {
          gameId: 'abcd1234',
          outcome: 'white_win',
          message: 'Game result processed successfully.',
        },
      }).as('validateResult');

      // 21) Validate the game result
      cy.get('input[name="gameId"]').type('abcd1234');
      cy.get('button').contains('Validate Result').click();

      cy.wait('@validateResult');
      cy.contains('Game result processed successfully.').should('be.visible');

      // (Optional) Check user balances again if the winner got tokens
      // or check status in the DB via an admin endpoint
    });
  });
});
