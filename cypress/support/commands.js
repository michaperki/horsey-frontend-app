// cypress/support/commands.js

// Log in a regular user via the UI
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login'); // Navigate to the login page
  cy.get('input[name="email"]').type(email); // Fill in the email input
  cy.get('input[name="password"]').type(password); // Fill in the password input
  cy.get('button[type="submit"]').click(); // Submit the form
  cy.url({ timeout: 10000 }).should('include', '/home');
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

// Verify user's balance on the profile page (example usage)
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

// **Mocking Lichess API Endpoints for a Specific User**
Cypress.Commands.add('mockLichessForUser', (userId) => {
  // Intercept GET /lichess/status
  cy.intercept('GET', '**/lichess/status', (req) => {
    const connected = Cypress.env(`lichessConnected_${userId}`) || false;
    req.reply({
      statusCode: 200,
      body: {
        connected: connected,
        lichessHandle: connected ? `testLichessUser_${userId}` : null,
      },
    });
  }).as(`mockLichessStatus_${userId}`);

  // Intercept GET /lichess/user
  cy.intercept('GET', '**/lichess/user', (req) => {
    const connected = Cypress.env(`lichessConnected_${userId}`) || false;
    req.reply({
      statusCode: 200,
      body: connected
        ? {
            username: `testLichessUser_${userId}`,
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
  }).as(`mockLichessUser_${userId}`);

  // Intercept POST /lichess/game (mocked game creation)
  cy.intercept('POST', '**/lichess/game', (req) => {
    const { variant, rated, clock, color } = req.body;
    const userIdFromAuth = req.headers['authorization']?.split('Bearer ')[1] || 'unknown';
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        gameId: `mockGame_${userIdFromAuth}_${Date.now()}`,
        gameLink: `https://lichess.org/mockGame_${userIdFromAuth}_${Date.now()}`,
      },
    });
  }).as(`mockCreateLichessGame_${userId}`);

  // Intercept POST /lichess/game/conclude (mocked game conclusion)
  cy.intercept('POST', '**/lichess/game/conclude', (req) => {
    const { gameId, outcome } = req.body;
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        gameId: gameId,
        outcome: outcome, // 'white', 'black', or 'draw'
        status: 'concluded',
      },
    });
  }).as(`mockConcludeLichessGame_${userId}`);
});

/**
 * Sets the Lichess connection state for a specific user and mocks the endpoints accordingly.
 * @param {string} userId - Identifier (e.g., 'userA', 'userB').
 * @param {boolean} connected - True if Lichess is connected for this user.
 */
Cypress.Commands.add('mockLichessFlowForUser', (userId, connected) => {
  Cypress.env(`lichessConnected_${userId}`, connected);
  cy.mockLichessForUser(userId);
});

// **New Command to Set Lichess Access Token**
Cypress.Commands.add('setLichessAccessToken', (email, token) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('backendUrl')}/test/set-lichess-token`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email,
      lichessAccessToken: token,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.log(`Lichess access token set for ${email}`);
  });
});
