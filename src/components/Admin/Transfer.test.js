
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../../contexts/AuthContext'; // Mock this
import Transfer from './Transfer';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext');

describe('Transfer Component', () => {
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

  test('renders the transfer form', () => {
    render(<Transfer />);

    expect(screen.getByText(/Admin Transfer Tokens/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/From Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/To Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transfer Tokens/i })).toBeInTheDocument();
  });

  test('handles successful token transfer', async () => {
    // Mock successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ txHash: '0x12345' }),
    });

    render(<Transfer />);

    fireEvent.change(screen.getByPlaceholderText(/From Address/i), {
      target: { value: '0xFromAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/To Address/i), {
      target: { value: '0xToAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Transfer Tokens/i }));

    await waitFor(() => {
      expect(screen.getByText(/Success! Transaction Hash: 0x12345/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/tokens/transfer', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-admin-token',
      },
      body: JSON.stringify({
        fromAddress: '0xFromAddress',
        toAddress: '0xToAddress',
        amount: '100',
      }),
    }));
  });

  test('handles transfer error gracefully', async () => {
    // Mock API response with error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Transfer failed' }),
    });

    render(<Transfer />);

    fireEvent.change(screen.getByPlaceholderText(/From Address/i), {
      target: { value: '0xFromAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/To Address/i), {
      target: { value: '0xToAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Transfer Tokens/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error: Transfer failed/i)).toBeInTheDocument();
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

    render(<Transfer />);

    fireEvent.click(screen.getByRole('button', { name: /Transfer Tokens/i }));

    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });

  test('handles unexpected API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error

    // Mock fetch to reject
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Transfer />);

    fireEvent.change(screen.getByPlaceholderText(/From Address/i), {
      target: { value: '0xFromAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/To Address/i), {
      target: { value: '0xToAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Transfer Tokens/i }));

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore(); // Restore original console.error after the test
  });
});

