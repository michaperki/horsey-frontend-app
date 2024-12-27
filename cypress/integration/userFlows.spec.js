
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
    // Reset the database and create a test user with a balance of 1000
    cy.request('POST', '/api/test/reset-database'); // Assuming you have a test endpoint for resetting
    cy.request('POST', '/api/auth/register', {
      username,
      email: uniqueEmail,
      password,
    }).then((response) => {
      expect(response.status).to.eq(201);
      // Optionally, set the initial balance if not set by default
      cy.request('POST', `/api/users/${response.body.id}/set-balance`, { balance: initialBalance });
    });
  });

  beforeEach(() => {
    // Clear cookies and local storage to ensure a clean state
    cy.clearCookies();
    cy.clearLocalStorage();

    // Mock external APIs only (e.g., Lichess API)
    cy.intercept('GET', 'https://lichess.org/api/game/*', { fixture: 'lichessGame.json' }).as('getLichessGame');
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
    
    // Wait for the Lichess API call if needed
    cy.wait('@getLichessGame');
    
    // Assert that the bet was placed successfully
    cy.contains('Bet placed successfully!')
      .should('be.visible');
    
    // ------------------------------
    // 4. Verify Updated Balance on Profile Page
    // ------------------------------
    cy.visit('/profile'); // Navigate to the Profile page where balance is displayed
    
    // Optionally, force a page reload to ensure fresh data fetch
    cy.reload();
    
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

