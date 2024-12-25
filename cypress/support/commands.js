
// cypress/support/commands.js

// Example: Custom command to log in a user
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name=email]').type(email);
  cy.get('input[name=password]').type(password);
  cy.get('button[type=submit]').click();
});

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
  });
});

Cypress.Commands.add('setAuthToken', () => {
  const token = Cypress.env('authToken');
  if (!token) {
    throw new Error('Token not found in Cypress.env');
  }

  cy.intercept('**', (req) => {
    req.headers['authorization'] = `Bearer ${token}`;
  });
});

Cypress.Commands.add('verifyBalance', (expectedBalance) => {
  cy.visit('/profile');
  cy.contains(`Balance: ${expectedBalance}`)
    .should('be.visible');
});
