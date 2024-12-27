
// cypress/integration/userFlows.spec.js

describe('User Flows with Mocked Lichess API', () => {
  // Generate a unique timestamp for unique user credentials
  const timestamp = Date.now();
  const uniqueEmail = `testuser_${timestamp}@example.com`;
  const username = `testuser_${timestamp}`;
  const password = 'Password123';
  
  // Define the mocked gameId as per your mock data
  const mockedGameId = 'mockedGameId';
  
  // Define initial balance based on your application's logic
  const initialBalance = 1000; // Adjust if different
  
  // Define the bet amount
  const betAmount = 100;

  before(() => {
    // Optional: Reset the database or seed data if necessary
    // This ensures a clean state before tests run
    // Example:
    // cy.request('POST', '/api/test/reset-database');
  });

  beforeEach(() => {
    // Intercept the GET /bets/history API call and respond with the fixture data
    cy.intercept('GET', '/bets/history*', { fixture: 'bets.json' }).as('getUserBets');

    // Intercept the POST /bets/place API call and respond with a mocked successful response
    cy.intercept('POST', '/bets/place', (req) => {
      // Optionally, you can validate the request body here
      expect(req.body).to.have.property('gameId', mockedGameId);
      expect(req.body).to.have.property('creatorColor');
      expect(req.body).to.have.property('amount', betAmount);

      // Respond with a successful bet placement
      req.reply({
        statusCode: 201,
        body: {
          message: 'Bet placed successfully!',
          bet: {
            id: 'newBetId123',
            creatorId: 'user123',
            creatorColor: req.body.creatorColor,
            gameId: req.body.gameId,
            amount: req.body.amount,
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        },
      });
    }).as('postPlaceBet');
  });

  it('Registers a new user, logs in, places a bet using mocked Lichess API, and verifies the updated balance on Profile page', () => {
    // ------------------------------
    // 1. Register a New User
    // ------------------------------
    cy.visit('/register');
    
    cy.get('input[name=username]')
      .type(username)
      .should('have.value', username);
    
    cy.get('input[name=email]')
      .type(uniqueEmail)
      .should('have.value', uniqueEmail);
    
    cy.get('input[name=password]')
      .type(password)
      .should('have.value', password);
    
    cy.get('button[type=submit]').click();
    
    // Assert that registration was successful
    cy.contains('Registration successful.')
      .should('be.visible');
    
    // ------------------------------
    // 2. Log In
    // ------------------------------
    cy.login(uniqueEmail, password); // Ensure cy.login is a custom Cypress command
    cy.contains('Dashboard')
      .should('be.visible');
    
    // ------------------------------
    // 3. Place a Bet Using Mocked Lichess API
    // ------------------------------
    cy.visit('/place-bet');
    
    // Input the mocked gameId
    cy.get('input[name=gameId]')
      .type(mockedGameId)
      .should('have.value', mockedGameId);
    
    // Select 'white' as per the mocked outcome
    cy.get('select[name=creatorColor]')
      .select('white')
      .should('have.value', 'white');
    
    // Enter the bet amount
    cy.get('input[name=amount]')
      .type(betAmount.toString())
      .should('have.value', betAmount.toString());
    
    // Submit the bet
    cy.get('button[type=submit]').click();
    
    // Wait for the POST /bets/place API call to complete
    cy.wait('@postPlaceBet').its('response.statusCode').should('eq', 201);
    
    // Assert that the bet was placed successfully
    cy.contains('Bet placed successfully!')
      .should('be.visible');
    
    // ------------------------------
    // 4. Verify Updated Balance on Profile Page
    // ------------------------------
    cy.visit('/profile'); // Navigate to the Profile page where balance is displayed
    
    // Wait for the GET /bets/history API call to complete
    cy.wait('@getUserBets');
    
    // Assert that the balance has been deducted correctly
    cy.contains(`${initialBalance - betAmount} PTK`)
      .should('be.visible');
    
    // Assert that 'Your Bets' section is visible
    cy.contains('Your Bets')
      .should('be.visible');

    // Optional: Verify the details of the placed bet
    cy.get('table').within(() => {
      cy.contains(mockedGameId)
        .should('be.visible');
      cy.contains('White')
        .should('be.visible');
      cy.contains(betAmount.toString())
        .should('be.visible');
      cy.contains('pending') // Assuming the initial status is 'pending'
        .should('be.visible');
    });
  });

  // Additional tests can be added here, such as handling insufficient balance, network errors, etc.
});

