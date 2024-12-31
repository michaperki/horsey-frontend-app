
// cypress/support/commands.js

// Log in a regular user
Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', `${Cypress.env('backendUrl')}/auth/login`, {
    email,
    password,
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('token', response.body.token);
  });
});

// Log in as admin and store token in localStorage
Cypress.Commands.add('loginAsAdmin', () => {
  const adminEmail = Cypress.env('INITIAL_ADMIN_EMAIL');
  const adminPassword = Cypress.env('INITIAL_ADMIN_PASSWORD');

  cy.request({
    method: 'POST',
    url: `${Cypress.env('backendUrl')}/auth/admin/login`,
    body: {
      email: adminEmail,
      password: adminPassword,
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

// Reset the database and reseed admin
Cypress.Commands.add('resetDatabaseAndSeedAdmin', () => {
  cy.request('POST', `${Cypress.env('backendUrl')}/test/reset-and-seed-admin`)
    .then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Database reset and admin seeded.');
    });
});

// Set Authorization header for all subsequent requests (if needed)
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
  cy.contains('Registration successful.')
    .should('be.visible');
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

// Mock necessary Lichess endpoints
Cypress.Commands.add('mockLichess', (connected = false) => {
  // Mock GET /lichess/status
  cy.intercept('GET', '**/lichess/status', {
    statusCode: 200,
    body: {
      connected: connected,
      lichessHandle: connected ? 'testLichessUser' : null,
    },
  }).as('mockLichessStatus');

  // Mock POST /auth/lichess/callback
  cy.intercept('POST', '**/auth/lichess/callback', {
    statusCode: 200,
    body: {
      lichessHandle: 'testLichessUser',
      connectedAt: new Date().toISOString(),
    },
  }).as('mockLichessCallback');

  // Mock GET /lichess/user
  cy.intercept('GET', '**/lichess/user', {
    statusCode: 200,
    body: {
      lichessHandle: connected ? 'testLichessUser' : null,
      // Add other necessary fields if required
    },
  }).as('mockLichessUser');
});

