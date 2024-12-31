// cypress/support/commands.js

// Register a new admin user
Cypress.Commands.add('registerAdmin', (username, email, password) => {
  cy.request('POST', '/auth/admin/register', {
    username,
    email,
    password,
  }).then((response) => {
    expect(response.status).to.eq(201);
  });
});

// Log in a user
Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', '/auth/login', {
    email,
    password,
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('token', response.body.token);
  });
});

// Log in as admin and store token in localStorage
Cypress.Commands.add('loginAsAdmin', () => {
  cy.request({
    method: 'POST',
    url: '/auth/admin/login', // Use relative URL based on baseUrl
    body: {
      email: Cypress.env('adminEmail'),
      password: Cypress.env('adminPassword'),
    },
    failOnStatusCode: false, // Prevent Cypress from failing the test on non-2xx status codes
  }).then((response) => {
    if (response.status !== 200) {
      // Log detailed error information
      cy.log('Admin Login Failed:', response.body);
      throw new Error(`Admin login failed with status ${response.status}: ${response.body.error}`);
    }
    const token = response.body.token;
    Cypress.env('authToken', token);
    window.localStorage.setItem('token', token); // Store token in localStorage
  });
});

// Log out a user by removing token from localStorage and visiting the login page
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  cy.visit('/login');
});

// Reset the database (requires admin privileges)
Cypress.Commands.add('resetDatabase', () => {
  const token = window.localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found for resetting the database.');
  }
  cy.request({
    method: 'POST',
    url: '/reset-database',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

// Set Authorization header for all subsequent requests
Cypress.Commands.add('setAuthToken', () => {
  const token = Cypress.env('authToken');
  if (!token) {
    throw new Error('Token not found in Cypress.env');
  }

  cy.intercept('**', (req) => {
    req.headers['authorization'] = `Bearer ${token}`;
  });
});

// Verify user's balance on the profile page
Cypress.Commands.add('verifyBalance', (expectedBalance) => {
  cy.visit('/profile');
  cy.contains(`Balance: ${expectedBalance}`)
    .should('be.visible');
});

// Register a new user via the UI
Cypress.Commands.add('registerUser', (username, email, password) => {
  cy.visit('/register');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Connect Lichess account (assuming a button triggers OAuth)
Cypress.Commands.add('connectLichess', () => {
  cy.get('button').contains('Connect Lichess').click();
});

// Mock window.open to prevent actual navigation during tests
Cypress.Commands.add('mockWindowOpen', () => {
  cy.window().then((win) => {
    cy.stub(win, 'open').as('windowOpen');
  });
});
