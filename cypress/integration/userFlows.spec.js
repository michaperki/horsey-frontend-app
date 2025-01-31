
// cypress/integration/userFlows.spec.js

describe('User Flow Tests with Mocked Lichess Interactions', () => {
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

  // Variables to store bet IDs and gameIds
  let placedBetId;
  let placedBetGameId; // Game ID from placeBet (expected to be null)
  let acceptedBetId;
  let acceptedBetGameId; // Game ID from acceptBet
  let finalGameId; // The gameId to use in conclude-game

  before(() => {
    // Reset DB and seed admin
    cy.resetDatabaseAndSeedAdmin();

    // Register both users
    cy.registerUser(userA.username, userA.email, userA.password);
    cy.registerUser(userB.username, userB.email, userB.password);

    // Set mocked Lichess Access Tokens for both users
    cy.setLichessAccessToken(userA.email, 'mockedAuthTokenA');
    cy.setLichessAccessToken(userB.email, 'mockedAuthTokenB');
  });

  beforeEach(() => {
    cy.viewport('macbook-15'); // Set viewport size
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.logout(); // Navigate to /login
  });

  context('User A - Login and Place Bet', () => {
    it('Should log in User A successfully after registering', () => {
      cy.login(userA.email, userA.password);
      cy.contains('Horsey').should('be.visible');
    });

    it('Should place a bet and capture the betId and gameId', () => {
      cy.login(userA.email, userA.password);

      cy.wait(1000);

      cy.get('.place-bet-open-button').click(); // Open the place bet modal
      cy.get('.place-bet-modal').should('be.visible');

      // Select Color Preference: White
      cy.contains('label.place-bet-tile', 'White').click();

      // Enter Bet Amount
      cy.get('input#amount').clear().type(`${betAmount}`);

      // Select Time Control: 5|3
      cy.contains('label.place-bet-tile', '5|3').click();

      // Select Variant: Standard
      cy.contains('label.place-bet-tile', 'Standard').click();

      // Select Currency Type: Tokens
      cy.contains('label.place-bet-tile', 'Tokens').click();

      // Intercept the place-bet API call to capture the betId and gameId
      cy.intercept('POST', '**/bets/place').as('placeBet');

      // Submit the bet
      cy.get('.place-bet-button').click();

      // Verify success message
      cy.contains('Bet placed successfully!').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button').click();

      // Wait for the placeBet API call and capture the betId and gameId
      cy.wait('@placeBet').then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
        placedBetId = interception.response.body.bet._id; // Adjust based on your API response structure
        placedBetGameId = interception.response.body.bet.gameId; // This should be null initially
        cy.log(`Bet placed with ID: ${placedBetId}, Game ID: ${placedBetGameId}`);
      });

      // Navigate to Profile and check "Your Bets"
      cy.visit('/profile');

      // Click the "History" tab
      cy.get('.vertical-tabs').contains('History').click();

      // **Selector for Bets Table**
      cy.get('table.w-full.border-collapse.mb-md').within(() => {
        cy.contains('td', `${betAmount}`).should('be.visible');
        cy.contains('td', 'Token').should('be.visible');
        cy.contains('td', 'Pending').should('be.visible');
      });
    });

    it('Should show an error for insufficient balance', () => {
      cy.login(userA.email, userA.password);

      cy.wait(1000);

      cy.get('.place-bet-open-button').click(); // Open the place bet modal
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
    it('Should log in User B successfully after registering', () => {
      cy.login(userB.email, userB.password);
      cy.contains('Horsey').should('be.visible');
    });
  });

  context('Multi-User Betting Flow', () => {
    it('User A places a real bet and User B accepts it', () => {
      // User A places a real bet
      cy.logout(); // Log out User B
      cy.login(userA.email, userA.password); // Login as User A

      cy.wait(1000);
      cy.get('.place-bet-open-button').click(); // Open the place bet modal
      cy.get('.place-bet-modal').should('be.visible');

      // **Real Interactions Without Mocks**

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

      // Intercept the place-bet API call to capture the betId and gameId
      cy.intercept('POST', '**/bets/place').as('placeBetReal');

      // Submit the bet
      cy.get('.place-bet-button').click();

      // Verify success message
      cy.contains('Bet placed successfully!').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button').click();

      // Wait for the placeBet API call and capture the betId and gameId (should be null)
      cy.wait('@placeBetReal').then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
        placedBetId = interception.response.body.bet._id;
        placedBetGameId = interception.response.body.bet.gameId; // Expected to be null
        cy.log(`Real Bet placed with ID: ${placedBetId}, Game ID: ${placedBetGameId}`);
      });

      // User B accepts the real bet
      cy.logout(); // Log out User A
      cy.login(userB.email, userB.password); // Login as User B

      cy.visit('/lobby'); // Navigate to lobby

      // **Intercept the accept-bet API call BEFORE clicking the join button**
      cy.intercept('POST', '**/bets/accept/**').as('acceptBet');

      // **Find and Accept the Real Bet**
      cy.get('table').within(() => {
        cy.get(`tr[data-bet-id="${placedBetId}"]`).within(() => {
          cy.get('button.join-button')
            .should('be.visible')
            .click();
        });
      });

      // Wait for the acceptBet API call and capture the acceptedBetId and gameId
      cy.wait('@acceptBet', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        acceptedBetId = interception.response.body.bet._id;
        acceptedBetGameId = interception.response.body.bet.gameId; // Capture gameId from acceptBet
        cy.log(`Bet accepted with ID: ${acceptedBetId}, Game ID: ${acceptedBetGameId}`);

        // Assert that acceptedBetId matches the original placedBetId
        expect(acceptedBetId).to.eq(placedBetId, `Expected betId to match but got: ${acceptedBetId}`);

        // Assign the finalGameId for concluding the game
        finalGameId = acceptedBetGameId;
        cy.log(`Final Game ID to conclude: ${finalGameId}`);

        // **Real Game Conclusion**
        // Now, conclude the game via the test endpoint
        cy.request('POST', `${Cypress.env('backendUrl')}/test/conclude-game`, {
          gameId: finalGameId, // Use the captured gameId from acceptBet
          outcome: 'white', // or 'black' or 'draw'
        }).then((response) => {
          expect(response.status).to.eq(200);
          cy.log('Game concluded via test endpoint');
        });
      });

      // Verify acceptance message
      cy.contains('Bet Accepted', { timeout: 20000 }).should('be.visible');

      // Assert Final Status
      cy.visit('/profile');

      // Click the "History" tab
      cy.get('.vertical-tabs').contains('History').click();

      // **Selector for Bets Table**
      cy.get('table.w-full.border-collapse.mb-md').within(() => {
        cy.contains('td', 'Won').should('be.visible'); // Adjust based on outcome
      });

      // Optionally, verify token balances
      // This can be implemented by fetching user balances and asserting the expected values
    });

    it('Should handle acceptance of non-existent or already accepted bets gracefully', () => {
      cy.login(userB.email, userB.password);

      // Attempt to accept a bet with an invalid betId
      const invalidBetId = 'invalidBetId123';
      cy.intercept('POST', `**/bets/accept/${invalidBetId}`).as('acceptInvalidBet');

      cy.visit('/lobby');

      cy.get('.available-bets-container').within(() => {
        cy.contains('No bets available right now.').should('be.visible');
      });

      // Optionally, attempt to click a non-existent join button and verify error handling
      cy.get(`tr[data-bet-id="${invalidBetId}"]`).should('not.exist');
    });
  });
});

