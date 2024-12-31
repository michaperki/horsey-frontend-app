
// cypress/integration/userFlows.spec.js

describe('User Flows with Real Backend Interaction', () => {
  // Generate a unique timestamp for unique user credentials
  const timestamp = Date.now();
  const uniqueEmail = `testuser_${timestamp}@example.com`;
  const username = `testuser_${timestamp}`;
  const password = 'Password123';
  
  // Define the bet amount
  const betAmount = 100;

  before(() => {
    // Optional: Reset the database or seed data if necessary
    // This ensures a clean state before tests run
    // Example:
    // cy.request('POST', '/api/test/reset-database');
  });

  beforeEach(() => {
    // Ensure that the backend is in a known state before each test
    // This could involve resetting the database or using API endpoints designed for testing
  });

  it('Registers a new user, logs in, places a bet, and verifies the updated balance on Profile page', () => {
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
    // 3. Place a Bet Using Real Backend
    // ------------------------------
    cy.visit('/place-bet');
    
    // Select 'white' as the creator's color from the dropdown
    cy.get('select[name=creatorColor]')
      .select('white')
      .should('have.value', 'white');
    
    // Enter the bet amount
    cy.get('input[name=amount]')
      .type(betAmount.toString())
      .should('have.value', betAmount.toString());
    
    // Submit the bet
    cy.get('button[type=submit]').click();
    
    // Assert that the bet was placed successfully
    cy.contains('Bet placed successfully!')
      .should('be.visible');
    
    // ------------------------------
    // 4. Verify Updated Balance on Profile Page
    // ------------------------------
    cy.visit('/profile'); // Navigate to the Profile page where balance is displayed
    
    // Wait for the profile page to load and display the updated balance
    cy.contains(`${1000 - betAmount} PTK`, { timeout: 10000 })
      .should('be.visible');
    
    // Assert that 'Your Bets' section is visible
    cy.contains('Your Bets')
      .should('be.visible');

    // Optional: Verify the details of the placed bet
    cy.get('table').within(() => {
      cy.contains('game_') // Assuming game IDs start with 'game_'
        .should('be.visible');
      cy.contains('White')
        .should('be.visible');
      cy.contains(betAmount.toString())
        .should('be.visible');
      cy.contains('Pending') // Assuming the initial status is 'pending'
        .should('be.visible');
    });
  });

  // Additional tests can be added here, such as handling insufficient balance, network errors, etc.
});

