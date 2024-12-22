
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Transfer from './Transfer';

describe('Transfer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'valid-admin-token');
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
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ txHash: '0x12345' }),
      })
    );

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
    expect(global.fetch).toHaveBeenCalledWith('/tokens/transfer', expect.any(Object));
  });

  test('handles transfer error gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Transfer failed' }),
      })
    );

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
    localStorage.removeItem('token');
    render(<Transfer />);

    fireEvent.click(screen.getByRole('button', { name: /Transfer Tokens/i }));

    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });

  test('handles unexpected API error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error

      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

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
