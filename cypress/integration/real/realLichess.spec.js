
// cypress/integration/real/realLichess.spec.js

describe('Real Lichess Interaction Tests', () => {
  const userA = {
    email: Cypress.env('authToken_a_email'), // Ensure these are set in a secure env file
    password: 'UserAPassword!', // Securely manage passwords
  };
  const userB = {
    email: Cypress.env('authToken_b_email'),
    password: 'UserBPassword!',
  };
  const betAmount = 100;

  before(() => {
    // Reset the database and seed admin if necessary
    cy.resetDatabaseAndSeedAdmin();

    // Register or login users as needed
    cy.registerUser(userA.username, userA.email, userA.password);
    cy.registerUser(userB.username, userB.email, userB.password);

    // **Important:** Set real Lichess Access Tokens for both users
    cy.setLichessAccessToken(userA.email, Cypress.env('authToken_a')); // Replace with real token
    cy.setLichessAccessToken(userB.email, Cypress.env('authToken_b')); // Replace with real token
  });

  beforeEach(() => {
    cy.viewport('macbook-15'); // Set viewport size
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.logout(); // Navigate to /login
    // **Do not set up mocks for real tests**
  });

  context('User A - Login', () => {
    it('Should log in User A successfully after registering', () => {
      cy.login(userA.email, userA.password);
      cy.contains('Horsey').should('be.visible');
    });
  });

  context('Real User Flow - Single User Actions', () => {
    it('Should place a real bet and appear in "Your Bets"', () => {
      cy.login(userA.email, userA.password);

      cy.get('.place-bet-open-button').click(); // Open the place bet modal
      cy.get('.place-bet-modal').should('be.visible');

      // **Real Interactions Without Mocks**

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

      // **Selector for Bets Table**
      cy.get('table.w-full.border-collapse.mb-md').within(() => {
        cy.contains('td', `${betAmount}`).should('be.visible');
        cy.contains('td', 'Token').should('be.visible');
        cy.contains('td', 'Pending').should('be.visible');
      });
    });
  });

  context('User B - Login', () => {
    it('Should log in User B successfully after registering', () => {
      cy.login(userB.email, userB.password);
      cy.contains('Horsey').should('be.visible');
    });
  });

  context('Multi-User Real Betting Flow', () => {
    it('User A places a real bet and User B accepts it', () => {
      // User A places a real bet
      cy.logout(); // Log out User B
      cy.login(userA.email, userA.password); // Login as User A

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

      // Submit the bet
      cy.get('.place-bet-button').click();

      // Verify success message
      cy.contains('Bet placed successfully!').should('be.visible');

      // Close the modal
      cy.get('.place-bet-close-button').click();

      // User B accepts the real bet
      cy.logout(); // Log out User A
      cy.login(userB.email, userB.password); // Login as User B

      cy.visit('/lobby'); // Navigate to lobby

      // **Find and Accept the Real Bet**
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

      // **Real Game Conclusion**
      // Since this is a real test, you might need to wait for the game to conclude manually
      // or have a backend process to conclude the game automatically.

      // Optionally, you can implement polling or webhook handling to verify game outcome

      // For demonstration, assuming an endpoint to conclude the game exists
      cy.request('POST', `${Cypress.env('backendUrl')}/test/conclude-game`, {
        gameId: 'realGameId123', // Replace with actual game ID if available
        outcome: 'white', // or 'black' or 'draw'
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.log('Game concluded via test endpoint');
      });

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
  });
});

