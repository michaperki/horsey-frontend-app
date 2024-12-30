
// src/components/Admin/Balance.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../../contexts/AuthContext'; // Mock this
import Balance from './Balance';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext');

describe('Balance Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAuth to simulate an authenticated admin user
    useAuth.mockReturnValue({
      token: 'valid-admin-token',
      user: { username: 'AdminUser' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  test('renders the balance form', () => {
    render(<Balance />);

    expect(screen.getByText(/Check Token Balance/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Wallet Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check Balance/i })).toBeInTheDocument();
  });

  test('handles successful balance check', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ balance: 100 }),
    });

    render(<Balance />);

    fireEvent.change(screen.getByPlaceholderText(/Wallet Address/i), {
      target: { value: '0xValidAddress' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Check Balance/i }));

    // Verify the success message
    await waitFor(() => {
      expect(screen.getByText(/Balance: 100 PTK/i)).toBeInTheDocument();
    });

    // Ensure fetch was called with the correct arguments
    expect(global.fetch).toHaveBeenCalledWith('/tokens/balance/0xValidAddress', expect.objectContaining({
      headers: { Authorization: 'Bearer valid-admin-token' },
    }));
  });

  test('handles error during balance check', async () => {
    // Mock API response with error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid address' }),
    });

    render(<Balance />);

    fireEvent.change(screen.getByPlaceholderText(/Wallet Address/i), {
      target: { value: '0xInvalidAddress' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Check Balance/i }));

    // Verify the error message
    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid address/i)).toBeInTheDocument();
    });
  });

  test('shows error when no token is present', () => {
    // Mock useAuth to simulate missing token
    useAuth.mockReturnValue({
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<Balance />);

    fireEvent.click(screen.getByRole('button', { name: /Check Balance/i }));

    // Verify the message about missing admin token
    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });

  test('handles unexpected API error gracefully', async () => {
    // Mock fetch to reject
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Balance />);

    fireEvent.change(screen.getByPlaceholderText(/Wallet Address/i), {
      target: { value: '0xValidAddress' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Check Balance/i }));

    // Verify the error message for unexpected API error
    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
    });
  });
});
