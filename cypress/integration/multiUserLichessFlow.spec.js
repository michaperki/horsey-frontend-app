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
    username: Cypress.env('INITIAL_ADMIN_USERNAME'), // e.g., "testadmin"
    email: Cypress.env('INITIAL_ADMIN_EMAIL'),       // e.g., "testadmin@example.com"
    password: Cypress.env('INITIAL_ADMIN_PASSWORD'), // e.g., "TestAdminPass123!"
  };

  // Example bet amount
  const betAmount = 100;

  // Simple wrapper function to call our command
  const mockLichessFlow = (connected = false) => {
    cy.mockLichessFlow(connected);
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

      // 2) Mock Lichess endpoints as disconnected
      mockLichessFlow(false);

      // 3) Prevent actual OAuth redirect
      cy.mockWindowOpen();

      // 4) Visit profile (should fetch /lichess/status and /lichess/user as "disconnected")
      cy.visit('/profile');
      cy.wait('@mockLichessStatus').its('response.statusCode').should('eq', 200);
      cy.wait('@mockLichessUser').its('response.body.connectedAt').should('be.null');

      // 5) Expect "Connect Lichess" to be visible and click it
      cy.get('button').contains('Connect Lichess').should('be.visible').click();

      // 6) Wait for the mocked Lichess callback (redirect)
      cy.wait('@mockLichessCallback');

      // 7) Verify that the page has been redirected with the success query parameter
      cy.url().should('include', 'lichess=connected');

      // 8) Now mock Lichess endpoints as connected
      mockLichessFlow(true);

      // 9) Re-visit /profile to see updated status
      cy.visit('/profile');
      cy.wait('@mockLichessStatus').its('response.body.connected').should('eq', true);

      // 10) Check the new /lichess/user response
      cy.wait('@mockLichessUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        const body = interception.response.body;
        cy.log('Mocked Lichess User Response:', body);
        expect(body.username).to.equal('testLichessUser');
        // The mock returns '2023-01-01T12:00:00Z'
        expect(body.connectedAt).to.equal('2023-01-01T12:00:00Z');
        expect(body.ratings).to.have.property('classical', 1500);
        expect(body.ratings).to.have.property('rapid', 1400);
        expect(body.ratings).to.have.property('blitz', 1300);
        expect(body.ratings).to.have.property('bullet', 1200);
      });

      // 11) Verify UI now shows connected data
      cy.contains('Lichess Connected').should('be.visible');
      cy.contains('testLichessUser').should('be.visible'); // The Lichess username
      // The date formatting might differ by locale; just check it has "2023"
      cy.get('[data-testid="connected-date"]').should('contain', '2023');
      // Verify rating labels
      cy.contains('Classical').should('be.visible').and('contain', '1500');
      cy.contains('Blitz').should('be.visible').and('contain', '1300');
      cy.contains('Rapid').should('be.visible').and('contain', '1400');
      cy.contains('Bullet').should('be.visible').and('contain', '1200');
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

      // 3) Mock Lichess as disconnected
      mockLichessFlow(false);
      cy.mockWindowOpen();

      // 4) Visit profile -> expect disconnected data
      cy.visit('/profile');
      cy.wait('@mockLichessStatus').its('response.statusCode').should('eq', 200);
      cy.wait('@mockLichessUser').its('response.body.username').should('equal', 'testAppUser');

      // 5) Click Connect Lichess
      cy.get('button').contains('Connect Lichess').should('be.visible').click();

      // 6) Wait for the mocked Lichess callback (redirect)
      cy.wait('@mockLichessCallback');

      // 7) Verify that the page has been redirected with the success query parameter
      cy.url().should('include', 'lichess=connected');

      // 8) Mock as connected
      mockLichessFlow(true);
      cy.visit('/profile');

      // 9) Confirm the new response is "connected"
      cy.wait('@mockLichessStatus').its('response.body.connected').should('eq', true);
      cy.wait('@mockLichessUser').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.body.username).to.eq('testLichessUser');
        expect(response.body.connectedAt).to.eq('2023-01-01T12:00:00Z');
        expect(response.body.ratings).to.have.property('classical', 1500);
        expect(response.body.ratings).to.have.property('rapid', 1400);
        expect(response.body.ratings).to.have.property('blitz', 1300);
        expect(response.body.ratings).to.have.property('bullet', 1200);
      });

      // 10) Log the mocked response for debugging
      cy.wait('@mockLichessUser').then((interception) => {
        cy.log('Mocked Lichess User Response:', interception.response.body);
      });

      // 11) Verify UI
      cy.contains('Lichess Connected').should('be.visible');
      cy.contains('testLichessUser').should('be.visible'); // Updated to Lichess username

      // Check 'Connected Since' with the fixed date
      cy.get('[data-testid="connected-date"]').should('contain', '2023');

      // Verify Ratings
      cy.contains('Classical').should('be.visible').and('contain', '1500');
      cy.contains('Rapid').should('be.visible').and('contain', '1400');
      cy.contains('Blitz').should('be.visible').and('contain', '1300');
      cy.contains('Bullet').should('be.visible').and('contain', '1200');
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
      cy.intercept('POST', '**/lichess/validate-result**', {
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
