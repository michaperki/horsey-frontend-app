
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
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) {
      cy.log('Admin Login Failed:', response.body);
      throw new Error(`Admin login failed with status ${response.status}: ${response.body.error}`);
    }
    const token = response.body.token;
    Cypress.env('authToken', token);
    window.localStorage.setItem('token', token);
  });
});

// Log out a user
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  cy.visit('/login');
});

// Reset DB and seed admin
Cypress.Commands.add('resetDatabaseAndSeedAdmin', () => {
  cy.request('POST', `${Cypress.env('backendUrl')}/test/reset-and-seed-admin`).then((response) => {
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
  cy.contains(`Balance: ${expectedBalance}`).should('be.visible');
});

// Register a new user via the UI
Cypress.Commands.add('registerUser', (username, email, password) => {
  cy.visit('/register');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.contains('Registration successful.').should('be.visible');
});

// Mock window.open to prevent actual navigation during tests
Cypress.Commands.add('mockWindowOpen', () => {
  cy.window().then((win) => {
    cy.stub(win, 'open').as('windowOpen');
  });
});

/**
 * Mocks the Lichess endpoints based on the connection state.
 */
Cypress.Commands.add('mockLichess', () => {
  // Intercept GET /lichess/status
  cy.intercept('GET', '**/lichess/status', (req) => {
    const connected = Cypress.env('lichessConnected') || false;
    req.reply({
      statusCode: 200,
      body: {
        connected: connected,
        lichessHandle: connected ? 'testLichessUser' : null,
      },
    });
  }).as('mockLichessStatus');

  // Intercept GET /lichess/user
  cy.intercept('GET', '**/lichess/user', (req) => {
    const connected = Cypress.env('lichessConnected') || false;
    req.reply({
      statusCode: 200,
      body: connected
        ? {
            username: 'testLichessUser',
            connectedAt: '2023-01-01T12:00:00Z',
            ratings: {
              classical: 1500,
              rapid: 1400,
              blitz: 1300,
              bullet: 1200,
            },
          }
        : {
            username: 'testAppUser',
            connectedAt: null,
            ratings: {},
          },
    });
  }).as('mockLichessUser');

  // Intercept GET /auth/lichess/callback to perform a redirect
  cy.intercept('GET', '**/auth/lichess/callback**', (req) => {
    req.reply((res) => {
      // Simulate redirect with query parameters indicating success
      res.redirect(`${Cypress.env('frontendUrl')}/dashboard?lichess=connected`);
    });
  }).as('mockLichessCallback');
});

/**
 * Sets the Lichess connection state and mocks the endpoints accordingly.
 * @param {boolean} connected - Whether Lichess is connected or not.
 */
Cypress.Commands.add('mockLichessFlow', (connected) => {
  Cypress.env('lichessConnected', connected);
  cy.mockLichess();
});

