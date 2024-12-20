
// frontend/src/components/Auth/AdminLogin.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react'; // Updated import
import AdminLogin from './AdminLogin';
import { BrowserRouter } from 'react-router-dom';

test('renders Admin Login form', () => {
  act(() => {
    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );
  });

  expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Admin Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Admin Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Login as Admin/i })).toBeInTheDocument();
});

test('handles input changes and form submission', () => {
  render(
    <BrowserRouter>
      <AdminLogin />
    </BrowserRouter>
  );

  const emailInput = screen.getByPlaceholderText(/Admin Email/i);
  const passwordInput = screen.getByPlaceholderText(/Admin Password/i);
  const loginButton = screen.getByRole('button', { name: /Login as Admin/i });

  fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'adminpassword' } });
  fireEvent.click(loginButton);

  // Add assertions based on expected behavior, e.g., API calls, state changes
  // For example, you can mock fetch and assert it was called with correct parameters
});

