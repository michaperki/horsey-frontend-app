// cypress/support/commands.js

// Log in a regular user via the UI
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login'); // Navigate to the login page
  cy.get('input[name="email"]').type(email); // Fill in the email input
  cy.get('input[name="password"]').type(password); // Fill in the password input
  cy.get('button[type="submit"]').click(); // Submit the form
  
  // Account for the ApiErrorContext changes that may show errors
  cy.get('.global-error-container').should('not.exist');
  
  // Wait for redirect with more reliable condition
  return cy.url({ timeout: 10000 }).should('include', '/home');
});

// Log in as admin and store token in localStorage
Cypress.Commands.add('loginAsAdmin', () => {
  const adminEmail = Cypress.env('INITIAL_ADMIN_EMAIL');
  const adminPassword = Cypress.env('INITIAL_ADMIN_PASSWORD');

  return cy.request({
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
      throw new Error(`Admin login failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }
    const token = response.body.token;
    Cypress.env('authToken', token);
    window.localStorage.setItem('token', token);
    
    // Verify token is set correctly
    return cy.wrap(window.localStorage.getItem('token')).should('eq', token);
  });
});

// Log out a user
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  cy.visit('/login');
  
  // Verify we're actually on the login page
  return cy.get('.auth-card').should('be.visible');
});

// Reset DB and seed admin
Cypress.Commands.add('resetDatabaseAndSeedAdmin', () => {
  return cy.request('POST', `${Cypress.env('backendUrl')}/test/reset-and-seed-admin`)
    .then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Database reset and admin seeded.');
    });
});

// Verify user's balance on the profile page
Cypress.Commands.add('verifyBalance', (expectedBalance, tokenType = 'token') => {
  cy.visit('/profile');
  
  // Wait for the profile page to load
  cy.get('.profile-page').should('be.visible');
  
  // Click on the Overview tab if not already active
  cy.get('.vertical-tabs').contains('Overview').click();
  
  // Check for the balance based on token type
  if (tokenType === 'token') {
    return cy.contains('Token Balance').parent().contains(expectedBalance).should('be.visible');
  } else {
    return cy.contains('Sweepstakes Balance').parent().contains(expectedBalance).should('be.visible');
  }
});

// Register a user and ensure the registration is complete before continuing
Cypress.Commands.add('registerUser', (username, email, password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('backendUrl')}/auth/register`,
    body: {
      username,
      email,
      password
    },
    failOnStatusCode: false
  }).then((response) => {
    // Check for successful registration (201 Created or 200 OK)
    if (![200, 201].includes(response.status)) {
      throw new Error(`Registration failed: ${JSON.stringify(response.body)}`);
    }
    cy.log(`User ${username} registered successfully`);
  });
});

// Set the Lichess token with retries
Cypress.Commands.add('setLichessAccessToken', (email, token, retries = 3) => {
  function attempt(retryCount) {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('backendUrl')}/test/set-lichess-token`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        email,
        lichessAccessToken: token,
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        cy.log(`Lichess access token set for ${email}`);
        return;
      } else if (retryCount > 0 && response.status === 404) {
        // If user not found and we have retries left, wait and try again
        cy.log(`User not found, retrying... (${retryCount} attempts left)`);
        cy.wait(1000); // Wait 1 second before retrying
        return attempt(retryCount - 1);
      } else {
        throw new Error(`Failed to set Lichess token: ${JSON.stringify(response.body)}`);
      }
    });
  }
  
  return attempt(retries);
});

// Mock Lichess API Endpoints for a Specific User
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

  // Intercept GET /lichess/user with updated response structure
  cy.intercept('GET', '**/lichess/user', (req) => {
    const connected = Cypress.env(`lichessConnected_${userId}`) || false;
    req.reply({
      statusCode: 200,
      body: connected
        ? {
            username: `testLichessUser_${userId}`,
            connectedAt: '2023-01-01T12:00:00Z',
            ratings: {
              standard: {
                classical: 1500,
                rapid: 1400,
                blitz: 1300,
                bullet: 1200,
              },
              variants: {
                crazyhouse: 1450,
                chess960: 1350
              }
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
    const { variant, timeControl, colorPreference } = req.body;
    const userIdFromAuth = req.headers['authorization']?.split('Bearer ')[1] || 'unknown';
    const gameId = `mockGame_${userIdFromAuth}_${Date.now()}`;
    
    req.reply({
      statusCode: 200,
      body: {
        success: true,
        gameId: gameId,
        gameLink: `https://lichess.org/${gameId}`,
        message: `Game created successfully: ${variant} ${timeControl} as ${colorPreference}`
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

// Set Lichess connection state for a specific user
Cypress.Commands.add('mockLichessFlowForUser', (userId, connected) => {
  Cypress.env(`lichessConnected_${userId}`, connected);
  return cy.mockLichessForUser(userId);
});

// Setup test users with proper chaining
Cypress.Commands.add('setupTestUsers', () => {
  const timestamp = Date.now();
  const userA = {
    id: 'userA',
    username: `UserA_${timestamp}`,
    email: `UserA_${timestamp}@test.com`,
    password: 'TestPass123!',
  };
  const userB = {
    id: 'userB',
    username: `UserB_${timestamp}`,
    email: `UserB_${timestamp}@test.com`,
    password: 'TestPass123!',
  };
  
  // Chain everything properly to avoid async/sync mixing
  return cy.resetDatabaseAndSeedAdmin()
    .then(() => {
      // Register User A
      return cy.registerUser(userA.username, userA.email, userA.password);
    })
    .then(() => {
      // Set Lichess token for User A
      return cy.setLichessAccessToken(userA.email, 'mockedAuthTokenA');
    })
    .then(() => {
      // Register User B
      return cy.registerUser(userB.username, userB.email, userB.password);
    })
    .then(() => {
      // Set Lichess token for User B
      return cy.setLichessAccessToken(userB.email, 'mockedAuthTokenB');
    })
    .then(() => {
      // Mock Lichess for both users - chain these properly
      return cy.mockLichessFlowForUser('userA', true)
        .then(() => {
          return cy.mockLichessFlowForUser('userB', true);
        })
        .then(() => {
          // Now we can return the users after all Cypress commands are complete
          return cy.wrap({ userA, userB });
        });
    });
});

// Utility to place a bet with enhanced selectors and proper chaining
Cypress.Commands.add('placeBet', (options = {}) => {
  const defaults = {
    colorPreference: 'white',
    amount: 100,
    timeControl: '5|3',
    variant: 'standard',
    currencyType: 'token'
  };
  
  const settings = { ...defaults, ...options };
  
  // Open the modal - using proper selector from PlaceBet.js
  cy.get('.place-bet-button').click();
  cy.get('.place-bet-modal').should('be.visible');
  
  // Select Color Preference - using correct selectors from PlaceBetModal.js
  if (settings.colorPreference.toLowerCase() === 'white') {
    cy.get('.place-bet-option.color-option.white-option').click();
  } else if (settings.colorPreference.toLowerCase() === 'black') {
    cy.get('.place-bet-option.color-option.black-option').click();
  } else {
    cy.get('.place-bet-option.color-option.random-option').click();
  }
  
  // Enter Bet Amount
  cy.get('#amount').clear().type(settings.amount.toString());
  
  // Select Time Control
  cy.contains('.place-bet-option.time-control-option', settings.timeControl).click();
  
  // Select Variant
  cy.get('.place-bet-option.variant-option')
    .contains(settings.variant, { matchCase: false })
    .click();
  
  // Intercept the API call to capture the bet ID
  cy.intercept('POST', '**/bets/place').as('placeBetRequest');
  
  // Submit the bet
  cy.get('.place-bet-submit').click();
  
  // Wait for the request to complete
  return cy.wait('@placeBetRequest').then((interception) => {
    // Verify the bet was successfully placed
    expect(interception.response.statusCode).to.be.oneOf([200, 201]);
    cy.contains('Bet Placed!').should('be.visible');
    
    // Close the modal
    cy.get('.place-bet-close-button').click();
    
    // Return the bet ID
    return interception.response.body.bet._id;
  });
});

// Utility to accept a bet with proper chaining
Cypress.Commands.add('acceptBet', (betId) => {
  cy.visit('/lobby');
  
  // Find and click the join button for the specified bet
  cy.intercept('POST', `**/bets/accept/${betId}`).as('acceptBetRequest');
  
  // Wait for the table to be visible and find the bet row by ID
  cy.get('.bets-table').within(() => {
    cy.get(`tr[data-bet-id="${betId}"]`).within(() => {
      cy.get('.join-button').click();
    });
  });
  
  // Wait for the API request to complete
  return cy.wait('@acceptBetRequest').then((interception) => {
    expect(interception.response.statusCode).to.eq(200);
    
    // The API response should contain the game ID
    const gameId = interception.response.body.bet.gameId;
    
    // Verify the UI confirms the bet was accepted
    cy.contains('Bet Accepted').should('be.visible');
    
    // Return the game ID
    return gameId;
  });
});

// Utility to conclude a game with proper chaining
Cypress.Commands.add('concludeGame', (gameId, outcome = 'white') => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('backendUrl')}/test/conclude-game`,
    body: {
      gameId,
      outcome
    },
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.log(`Game ${gameId} concluded with outcome: ${outcome}`);
  });
});

// Add test step logging utility
Cypress.Commands.add('testStep', (description) => {
  Cypress.log({
    name: 'STEP',
    displayName: '🔍 TEST STEP',
    message: description,
    consoleProps: () => {
      return {
        'Step': description,
        'Timestamp': new Date().toLocaleString()
      };
    }
  });
});
