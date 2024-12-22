
// cypress/integration/userFlows.spec.js

describe('User Flows', () => {
  const timestamp = Date.now();
  const uniqueEmail = `testuser_${timestamp}@example.com`;
  const username = `testuser_${timestamp}`;
  const password = 'Password123';

  it('Registers a new user, logs in, places a bet, and views the dashboard', () => {
    // Register a new user with unique email and username
    cy.visit('/register');
    cy.get('input[name=username]').type(username);
    cy.get('input[name=email]').type(uniqueEmail);
    cy.get('input[name=password]').type(password);
    cy.get('button[type=submit]').click();
    cy.contains('Registration successful.');

    // Log in
    cy.login(uniqueEmail, password);
    cy.contains('Dashboard');

    // Place a bet
    cy.visit('/place-bet');
    cy.get('select[name=gameId]').select('game123');
    cy.get('input[name=choice]').check('white');
    cy.get('input[name=amount]').type('100');
    cy.get('button[type=submit]').click();
    cy.contains('Bet placed successfully');

    // View the dashboard
    cy.visit('/dashboard');
    cy.contains('Balance: 400'); // Adjust based on your application's logic
    cy.contains('Your Bets');
  });
});

