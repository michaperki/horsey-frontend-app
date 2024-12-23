
// cypress/support/commands.js

// Example: Custom command to log in a user
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name=email]').type(email);
  cy.get('input[name=password]').type(password);
  cy.get('button[type=submit]').click();
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.request('POST', '/auth/admin/login', {
    email: Cypress.env('adminEmail'),
    password: Cypress.env('adminPassword'),
  }).then((response) => {
    expect(response.status).to.eq(200);
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
