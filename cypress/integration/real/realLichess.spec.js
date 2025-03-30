// cypress/integration/real/realLichess.spec.js

describe('Real Lichess Interaction Tests', () => {
  // Note: In real tests, we should use environment variables for these credentials
  const userA = {
    email: Cypress.env('authToken_a_email'),
    password: Cypress.env('authToken_a_password') || 'UserAPassword!',
  };
  const userB = {
    email: Cypress.env('authToken_b_email'),
    password: Cypress.env('authToken_b_password') || 'UserBPassword!',
  };
  const betAmount = 100;
  let placedBetId;
  let gameId;

  before(() => {
    // Reset the database and seed admin if necessary
    cy.resetDatabaseAndSeedAdmin();

    // Ensure we have real users with Lichess tokens 
    cy.request({
      method: 'POST',
      url: `${Cypress.env('backendUrl')}/test/create-user-if-not-exists`,
      body: {
        email: userA.email,
        username: 'TestUserA',
        password: userA.password
      }
    });

    cy.request({
      method: 'POST',
      url: `${Cypress.env('backendUrl')}/test/create-user-if-not-exists`,
      body: {
        email: userB.email,
        username: 'TestUserB',
        password: userB.password
      }
    });

    // Set real Lichess Access Tokens for both users
    cy.setLichessAccessToken(userA.email, Cypress.env('authToken_a'));
    cy.setLichessAccessToken(userB.email, Cypress.env('authToken_b')); 
  });

  beforeEach(() => {
    cy.viewport('macbook-15');
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  context('Lichess Connection Verification', () => {
    it('Should show User A as connected to Lichess', () => {
      cy.login(userA.email, userA.password);
      
      // Check profile page for Lichess connection
      cy.visit('/profile');
      cy.get('.vertical-tabs').contains('Account').click();
      
      // Find Lichess account section and verify it shows connected
      cy.contains('Lichess Account')
        .parent()
        .within(() => {
          cy.contains('Username:').should('be.visible');
          cy.contains('Connected Since:').should('be.visible');
        });
    });
  });

  context('Real Betting Flow', () => {
    it('Should place a real bet with Lichess integration', () => {
      cy.login(userA.email, userA.password);

      // Open bet modal - using proper selector from PlaceBet.js
      cy.get('.place-bet-button').click();
      cy.get('.place-bet-modal').should('be.visible');
      
      // Select options using classes from PlaceBetModal.js
      cy.get('.place-bet-option.color-option.white-option').click();
      cy.get('#amount').clear().type(`${betAmount}`);
      cy.contains('.place-bet-option.time-control-option', '5|3').click();
      cy.get('.place-bet-option.variant-option').contains('Standard').click();
      
      // Intercept the place bet API call
      cy.intercept('POST', '**/bets/place').as('placeBet');
      cy.get('.place-bet-submit').click();
      
      // Verify success and capture the bet ID
      cy.wait('@placeBet').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
        placedBetId = interception.response.body.bet._id;
        cy.log(`Real bet placed with ID: ${placedBetId}`);
        
        // Confirm success message
        cy.contains('Bet Placed!').should('be.visible');
        cy.get('.place-bet-close-button').click();
      });
      
      // Verify the bet appears in history
      cy.visit('/profile');
      cy.get('.vertical-tabs').contains('History').click();
      cy.get('table').contains('Pending').should('be.visible');
    });
    
    it('Should allow User B to accept the bet', () => {
      // Skip this test if no bet was placed
      if (!placedBetId) {
        cy.log('Skipping acceptance test - no bet was placed');
        return;
      }
      
      // Login as User B
      cy.login(userB.email, userB.password);
      cy.visit('/lobby');
      
      // Intercept game creation API call
      cy.intercept('POST', '**/bets/accept/**').as('acceptBet');
      
      // Find and accept the bet
      cy.get('.bets-table').within(() => {
        // Look for the bet and click the join button
        cy.get(`tr[data-bet-id="${placedBetId}"]`).within(() => {
          cy.get('.join-button').click();
        });
      });
      
      // Wait for the bet acceptance to complete
      cy.wait('@acceptBet', { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        gameId = interception.response.body.bet.gameId;
        cy.log(`Game created with ID: ${gameId}`);
        
        // Verify bet accepted notification appears
        cy.contains('Bet Accepted', { timeout: 10000 }).should('be.visible');
      });
    });
    
    it('Should be able to view and conclude the game', () => {
      // Skip if no game was created
      if (!gameId) {
        cy.log('Skipping game conclusion test - no game was created');
        return;
      }
      
      // Note: In a real test with actual Lichess integration, we would either:
      // 1. Redirect to Lichess to play the game manually
      // 2. Use Lichess API to automate the game conclusion
      
      // For our test, we'll use our test endpoint to conclude the game
      cy.request({
        method: 'POST',
        url: `${Cypress.env('backendUrl')}/test/conclude-game`,
        body: {
          gameId: gameId,
          outcome: 'white' // User A (white) wins
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.log('Game concluded via test endpoint');
      });
      
      // Login as User A to verify the win
      cy.login(userA.email, userA.password);
      cy.visit('/profile');
      cy.get('.vertical-tabs').contains('History').click();
      
      // The bet should now show as won
      cy.contains('Won', { timeout: 10000 }).should('be.visible');
      
      // Logout and check User B's status
      cy.logout();
      cy.login(userB.email, userB.password);
      cy.visit('/profile');
      cy.get('.vertical-tabs').contains('History').click();
      
      // User B should see a "Lost" status
      cy.contains('Lost', { timeout: 10000 }).should('be.visible');
    });
  });
  
  context('Lichess Account Management', () => {
    it('Should show Lichess ratings in profile', () => {
      cy.login(userA.email, userA.password);
      cy.visit('/profile');
      cy.get('.vertical-tabs').contains('Account').click();
      
      // Check for ratings display
      cy.contains('Standard Ratings:').should('be.visible');
      
      // There should be at least one rating displayed
      cy.get('table').first().find('tr').its('length').should('be.gt', 1);
    });
    
    // Note: We can't actually test disconnecting without breaking the other tests
    // but we can verify the disconnect button exists
    it('Should show disconnect option for Lichess account', () => {
      cy.login(userA.email, userA.password);
      cy.visit('/profile');
      cy.get('.vertical-tabs').contains('Account').click();
      
      // Find the disconnect button
      cy.contains('Disconnect Lichess').should('be.visible');
    });
  });
});
