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

  // Variables to store bet IDs
  let placedBetId;
  let acceptedBetId;

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

    it('Should place a bet and capture the betId', () => {
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

      // Intercept the place-bet API call to capture the betId
      cy.intercept('POST', '**/bets/place').as('placeBet');

      // Submit the bet
      cy.get('.place-bet-button').click();

      // Verify success message
      cy.contains('Bet placed successfully!').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button').click();

      // Wait for the placeBet API call and capture the betId
      cy.wait('@placeBet').then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
        placedBetId = interception.response.body.bet._id; // Adjust based on your API response structure
        cy.log(`Bet placed with ID: ${placedBetId}`);
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
    it('User B accepts User A\'s bet successfully', () => {
      // Ensure User A is logged out and User B is logged in
      cy.logout();
      cy.mockLichessFlowForUser(userB.id, true);
      cy.login(userB.email, userB.password);

      // Wait for mocked Lichess status and user data
      cy.wait(`@mockLichessStatus_${userB.id}`);
      cy.wait(`@mockLichessUser_${userB.id}`);

      // Navigate to Lobby to view available bets
      cy.visit('/lobby');

      // **Intercept the accept-bet API call before clicking the button**
      cy.intercept('POST', '**/bets/accept/**').as('acceptBet');

      // **Find and Accept the Specific Bet**
      // Assuming each bet row has a data attribute like data-bet-id
      cy.get('table.available-bets-table').within(() => {
        cy.get(`tr[data-bet-id="${placedBetId}"]`).within(() => {
          cy.get('button.join-button')
            .should('be.visible')
            .click();
        });
      });

      // Wait for the acceptBet API call and capture the acceptedBetId
      cy.wait('@acceptBet', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        acceptedBetId = interception.response.body.bet._id;
        cy.log(`Bet accepted with ID: ${acceptedBetId}`);

        // Assert that acceptedBetId matches the original placedBetId
        expect(acceptedBetId).to.eq(placedBetId, `Expected betId to match but got: ${acceptedBetId}`);
      });

      // Verify acceptance message
      cy.contains('Bet Accepted', { timeout: 20000 }).should('be.visible');

      // Verify that the bet status has been updated in User B's profile
      cy.visit('/profile');

      // Click the "History" tab
      cy.get('.vertical-tabs').contains('History').click();

      // **Selector for Bets Table**
      cy.get('table.w-full.border-collapse.mb-md').within(() => {
        cy.contains('td', `${betAmount}`).should('be.visible');
        cy.contains('td', 'Token').should('be.visible');
        cy.contains('td', 'Matched').should('be.visible'); // Assuming status changes to 'Matched'
      });
    });

    it('Should handle acceptance of non-existent or already accepted bets gracefully', () => {
      cy.login(userB.email, userB.password);

      // Attempt to accept a bet with an invalid betId
      const invalidBetId = 'invalidBetId123';
      cy.intercept('POST', `**/bets/accept/${invalidBetId}`).as('acceptInvalidBet');

      cy.visit('/lobby');

      cy.get('table.available-bets-table').within(() => {
        cy.get(`tr[data-bet-id="${invalidBetId}"]`).within(() => {
          cy.get('button.join-button')
            .should('not.exist'); // Button should not exist for invalid betId
        });
      });

      // Alternatively, attempt to send a POST request directly
      cy.request({
        method: 'POST',
        url: `/bets/accept/${invalidBetId}`,
        failOnStatusCode: false, // Prevent Cypress from failing the test on non-2xx status
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.eq('Bet is no longer available or does not exist');
      });
    });
  });
});
