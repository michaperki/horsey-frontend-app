
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
  const initialBalance = 500; // Adjust if different
  
  before(() => {
    // Optional: Reset the database or seed data if necessary
    // This ensures a clean state before tests run
    // Example:
    // cy.request('POST', '/api/test/reset-database');
  });

  it('Registers a new user, logs in, places a bet using mocked Lichess API, and views the dashboard', () => {
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
    cy.get('select[name=choice]')
      .select('white')
      .should('have.value', 'white');
    
    // Enter the bet amount
    const betAmount = 100;
    cy.get('input[name=amount]')
      .type(betAmount.toString())
      .should('have.value', betAmount.toString());
    
    // Submit the bet
    cy.get('button[type=submit]').click();
    
    // Assert that the bet was placed successfully
    cy.contains('Bet placed successfully')
      .should('be.visible');
    
    // ------------------------------
    // 4. View the Dashboard
    // ------------------------------
    cy.visit('/dashboard');
    
    // Assert that the balance has been deducted correctly
    cy.contains(`Balance: ${initialBalance - betAmount}`)
      .should('be.visible');
    
    // Assert that 'Your Bets' section is visible
    cy.contains('Your Bets')
      .should('be.visible');
    
    // Optional: Verify the details of the placed bet
    cy.contains('Your Bets').within(() => {
      cy.contains(mockedGameId)
        .should('be.visible');
      cy.contains('white')
        .should('be.visible');
      cy.contains(betAmount.toString())
        .should('be.visible');
      // Add more assertions if necessary, such as outcome or status
    });
  });
});

