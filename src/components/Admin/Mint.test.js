// src/components/Admin/Mint.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Mint from './Mint';
import * as AuthContextModule from '../../contexts/AuthContext'; // Adjust the path if necessary
import { BrowserRouter as Router } from 'react-router-dom';

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Mint Component', () => {
  const mockedUseAuth = AuthContextModule.useAuth;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'valid-admin-token');
  });

  test('renders the mint form', () => {
    // Mock useAuth to return a logged-in admin user
    mockedUseAuth.mockReturnValue({
      token: 'valid-admin-token',
      user: { username: 'AdminUser' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <Router>
        <Mint />
      </Router>
    );

    expect(screen.getByText(/Admin Mint Tokens/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Recipient Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mint Tokens/i })).toBeInTheDocument();
  });

  test('handles successful token minting', async () => {
    // Mock useAuth to return a valid token
    mockedUseAuth.mockReturnValue({
      token: 'valid-admin-token',
      user: { username: 'AdminUser' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock the fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ txHash: '0x12345' }),
      })
    );

    render(
      <Router>
        <Mint />
      </Router>
    );

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText(/Recipient Address/i), {
      target: { value: '0xValidAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Mint Tokens/i }));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Success! Transaction Hash: 0x12345/i)).toBeInTheDocument();
    });

    // Assert that fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith('/tokens/mint', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-admin-token',
      },
      body: JSON.stringify({
        toAddress: '0xValidAddress',
        amount: '100',
      }),
    }));
  });

  test('handles minting error gracefully', async () => {
    // Mock useAuth to return a valid token
    mockedUseAuth.mockReturnValue({
      token: 'valid-admin-token',
      user: { username: 'AdminUser' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock the fetch API to return an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Minting failed' }),
      })
    );

    render(
      <Router>
        <Mint />
      </Router>
    );

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText(/Recipient Address/i), {
      target: { value: '0xInvalidAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Mint Tokens/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Error: Minting failed/i)).toBeInTheDocument();
    });

    // Assert that fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith('/tokens/mint', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-admin-token',
      },
      body: JSON.stringify({
        toAddress: '0xInvalidAddress',
        amount: '100',
      }),
    }));
  });

  test('shows error when no token is present', () => {
    // Mock useAuth to return no token
    mockedUseAuth.mockReturnValue({
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <Router>
        <Mint />
      </Router>
    );

    // Simulate button click without setting token
    fireEvent.click(screen.getByRole('button', { name: /Mint Tokens/i }));

    // Assert that the appropriate error message is displayed
    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });
});
