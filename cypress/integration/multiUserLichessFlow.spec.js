// cypress/integration/multiUserLichessFlow.spec.js

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
    username: Cypress.env('INITIAL_ADMIN_USERNAME'),
    email: Cypress.env('INITIAL_ADMIN_EMAIL'),
    password: Cypress.env('INITIAL_ADMIN_PASSWORD'),
  };

  // Example bet amount
  const betAmount = 100;

  // Decide if we are mocking Lichess or not, based on environment variables
  // (e.g., MOCK_LICHESS=true => mock, REAL_LICHESS=true => real calls)
  // Note: You can adjust this logic to prefer REAL_LICHESS if both are set, etc.
  const isMockMode = Cypress.env('MOCK_LICHESS') === true || Cypress.env('MOCK_LICHESS') === 'true';
  const isRealMode = Cypress.env('REAL_LICHESS') === true || Cypress.env('REAL_LICHESS') === 'true';

  /**
   * Helper to either mock Lichess or let real calls through,
   * depending on environment variables.
   * 
   * @param {boolean} connected - Whether user is "connected" to Lichess or not.
   */
  const mockLichessFlow = (connected = false) => {
    if (isMockMode) {
      // Use your custom command that intercepts calls
      cy.mockLichessFlow(connected);
    } else {
      // In "Real Mode," do not intercept or mock; let real calls go out
      // Optionally, you can stub out only partial routes if you want
      cy.log('Running in REAL Lichess mode - no mocking intercepts applied.');
    }
  };

  /**
   * Parameterized "Connect Lichess" logic:
   * - If real mode, do the actual OAuth flow.
   * - If mock mode, continue using mock approach.
   * 
   * (This is just an example; you may already have a more complex flow.)
   */
  Cypress.Commands.add('connectLichess', (connected) => {
    if (isMockMode) {
      // 1) Mock endpoints
      mockLichessFlow(false);
      // 2) Prevent actual redirect
      cy.mockWindowOpen();
      // 3) Trigger "Connect Lichess" button
      cy.get('button').contains('Connect Lichess').click();
      // 4) Wait for the mock callback
      cy.wait('@mockLichessCallback');
      // 5) Mark user as connected
      mockLichessFlow(connected);
      cy.log('User is now connected in mock mode');
    } else if (isRealMode) {
      // *Real* Lichess flow:
      // 1) Click "Connect Lichess" -> will redirect to actual Lichess site
      cy.get('button').contains('Connect Lichess').click();
      // You might need to handle a new tab or route, or come back with a `cy.origin()` approach
      // or set up your real OAuth callback testing strategy
      cy.log('Real Lichess connection triggered.');
    }
  });

  before(() => {
    // 1) Reset DB and seed admin
    cy.resetDatabaseAndSeedAdmin();

    // 2) Log in as admin (storing token in localStorage)
    cy.loginAsAdmin().then(() => {
      cy.log('Admin logged in successfully.');
    });

    // 3) Register user A & user B via UI
    cy.registerUser(userA.username, userA.email, userA.password);
    cy.registerUser(userB.username, userB.email, userB.password);
  });

  context('User A - Registration, Login, Connect Lichess', () => {
    it('Logs in User A and connects to Lichess (mock or real)', () => {
      // 1) Log in User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 2) Attempt Lichess connection based on mode
      cy.visit('/profile');
      cy.connectLichess(true); // "true" => connected
      // Validate UI in either mock or real scenario
      if (isMockMode) {
        // Confirm we see "Lichess Connected" & mock data
        cy.contains('Lichess Connected').should('be.visible');
        cy.contains('testLichessUser').should('be.visible');
      } else {
        // Real mode: just confirm we get back to the profile or see some success indicator
        cy.contains('Profile').should('be.visible');
      }
    });
  });

  context('User B - Registration, Login, Connect Lichess', () => {
    it('Logs in User B and connects to Lichess (mock or real)', () => {
      // 1) Log out from User A
      cy.logout();

      // 2) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 3) Attempt Lichess connection based on mode
      cy.visit('/profile');
      cy.connectLichess(true); // "true" => connected
      if (isMockMode) {
        cy.contains('Lichess Connected').should('be.visible');
        cy.contains('testLichessUser').should('be.visible');
      } else {
        cy.contains('Profile').should('be.visible');
      }
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
      cy.get('select[name="creatorColor"]').select('White');
      cy.get('input[name="amount"]').type(`${betAmount}`);
      cy.get('button').contains('Place Bet').click();

      // 4) Confirm bet placement
      cy.contains('Bet placed successfully!').should('be.visible');

      // 5) (Optional) Check updated balance
      cy.visit('/profile');
      // Adjust logic if your user starts with a different balance
      cy.contains(`${1000 - betAmount} PTK`).should('be.visible');

      // 6) Log out from User A
      cy.logout();

      // 7) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/available-bets');
      cy.contains('Available Bets').should('be.visible');

      // 8) Locate newly created bet from User A
      cy.get('table').within(() => {
        cy.contains(userA.username)
          .parent('tr')
          .within(() => {
            cy.get('button').contains('Accept').click();
          });
      });

      // 9) Confirm acceptance
      cy.contains('Successfully joined the bet!').should('be.visible');
    });
  });

  context('Bet Cancellation Flow', () => {
    it('User A places a bet and cancels it before User B can accept', () => {
      // 1) Log out from user B (if not already)
      cy.logout();

      // 2) Log in as User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 3) Place a new bet
      cy.visit('/place-bet');
      cy.get('select[name="creatorColor"]').select('Black');
      cy.get('input[name="amount"]').type(`${betAmount}`);
      cy.get('button').contains('Place Bet').click();

      // 4) Confirm bet placement
      cy.contains('Bet placed successfully!').should('be.visible');

      // 5) Go to Profile / "Your Bets" and cancel it
      cy.visit('/profile');
      cy.contains('Your Bets').should('be.visible');
      // In your "YourBets" table or UI, find the newly placed bet (status = pending)
      cy.get('table').within(() => {
        cy.contains('pending')
          .parent('tr')
          .within(() => {
            cy.get('button').contains('Cancel').click();
          });
      });

      // 6) Confirm it is canceled, and check balance
      cy.contains('Failed to cancel the bet').should('not.exist'); // Just ensure no error
      // Maybe the UI changes status to "canceled"
      cy.contains('canceled').should('be.visible');
      // Also check if user balance is restored
      cy.visit('/profile');
      // If we started at 1000, placed a 100 bet, and canceled, we should be back to 1000
      cy.contains(`1000 PTK`).should('be.visible');
    });

    it('(Optional) Attempt to have User B accept a canceled bet and confirm it errors out', () => {
      // 1) Log out as User A
      cy.logout();

      // 2) Log in as User B
      cy.login(userB.email, userB.password);
      cy.visit('/available-bets');
      cy.contains('Available Bets').should('be.visible');

      // The canceled bet might be removed entirely from the "Available Bets" list,
      // or if for some reason it still shows up in your UI, the accept attempt fails:
      cy.get('table').within(() => {
        // If you do show canceled bets, or if they remain "pending" in the list momentarily:
        cy.contains(userA.username).should('not.exist'); 
        // Or if it does exist, confirm an error is displayed upon join:
        // (Pseudocode; adapt to your UI)
        // cy.contains(userA.username)
        //   .parent('tr')
        //   .within(() => {
        //     cy.get('button').contains('Join Bet').click();
        //   });
        // cy.contains('This bet is no longer available').should('be.visible');
      });
    });

    it('(Optional) After cancellation, User A can place a new bet', () => {
      // 1) Log out from user B
      cy.logout();
      
      // 2) Log in as User A
      cy.login(userA.email, userA.password);
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // 3) Place a new bet (could be same or different amount)
      cy.visit('/place-bet');
      cy.get('select[name="creatorColor"]').select('Random');
      cy.get('input[name="amount"]').type('75');
      cy.get('button').contains('Place Bet').click();
      
      // 4) Confirm success
      cy.contains('Bet placed successfully!').should('be.visible');
      cy.visit('/profile');
      // Check new balance: (if 1000, minus 75, expect 925)
      cy.contains('925 PTK').should('be.visible');
    });
  });

  // (Optional) Admin Validates Game Result context, etc...
  // ... your existing admin test ...
});

/**
 * HOW TO RUN:
 * 
 * 1) **Mock Mode** (the default, if you do not set environment variables):
 *    npx cypress run
 * 
 * 2) **Mock Mode** (explicit):
 *    MOCK_LICHESS=true REAL_LICHESS=false npx cypress run
 * 
 * 3) **Real Mode**:
 *    MOCK_LICHESS=false REAL_LICHESS=true npx cypress run
 * 
 * Adjust your environment variables or cypress.config.js as needed.
 */
