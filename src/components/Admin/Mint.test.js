
// src/components/Admin/Mint.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Mint from './Mint';

describe('Mint Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'valid-admin-token');
  });

  test('renders the mint form', () => {
    render(<Mint />);

    expect(screen.getByText(/Admin Mint Tokens/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Recipient Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mint Tokens/i })).toBeInTheDocument();
  });

  test('handles successful token minting', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ txHash: '0x12345' }),
      })
    );

    render(<Mint />);

    fireEvent.change(screen.getByPlaceholderText(/Recipient Address/i), {
      target: { value: '0xValidAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Mint Tokens/i }));

    await waitFor(() => {
      expect(screen.getByText(/Success! Transaction Hash: 0x12345/i)).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith('/tokens/mint', expect.any(Object));
  });

  test('handles minting error gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Minting failed' }),
      })
    );

    render(<Mint />);

    fireEvent.change(screen.getByPlaceholderText(/Recipient Address/i), {
      target: { value: '0xInvalidAddress' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount/i), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Mint Tokens/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error: Minting failed/i)).toBeInTheDocument();
    });
  });

  test('shows error when no token is present', () => {
    localStorage.removeItem('token');
    render(<Mint />);

    fireEvent.click(screen.getByRole('button', { name: /Mint Tokens/i }));

    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });
});
