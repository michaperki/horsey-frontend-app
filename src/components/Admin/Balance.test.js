
// src/components/Admin/Balance.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Balance from './Balance';

describe('Balance Component', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'valid-admin-token');

    // Suppress console.error temporarily
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    consoleSpy.mockRestore();
  });

  test('renders the balance form', () => {
    render(<Balance />);

    expect(screen.getByText(/Check Token Balance/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Wallet Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check Balance/i })).toBeInTheDocument();
  });

  test('handles successful balance check', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ balance: 100 }),
      })
    );

    render(<Balance />);

    fireEvent.change(screen.getByPlaceholderText(/Wallet Address/i), {
      target: { value: '0xValidAddress' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Check Balance/i }));

    await waitFor(() => {
      expect(screen.getByText(/Balance: 100 PTK/i)).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/tokens/balance/0xValidAddress', expect.any(Object));
  });

  test('handles error during balance check', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid address' }),
      })
    );

    render(<Balance />);

    fireEvent.change(screen.getByPlaceholderText(/Wallet Address/i), {
      target: { value: '0xInvalidAddress' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Check Balance/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid address/i)).toBeInTheDocument();
    });
  });

  test('shows error when no token is present', () => {
    localStorage.removeItem('token');
    render(<Balance />);

    fireEvent.click(screen.getByRole('button', { name: /Check Balance/i }));

    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });

  test('handles unexpected API error gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    render(<Balance />);

    fireEvent.change(screen.getByPlaceholderText(/Wallet Address/i), {
      target: { value: '0xValidAddress' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Check Balance/i }));

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
    });
  });
});
