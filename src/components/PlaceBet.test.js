
// src/components/PlaceBet.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlaceBet from './PlaceBet';

// Mock the fetch API
global.fetch = jest.fn();

describe('PlaceBet Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
  });

  test('renders bet form with user balance', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ balance: 1000 }),
      })
    );

    render(<PlaceBet />);

    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 1000 PTK/i)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Lichess Game ID/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Amount to Bet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Place Bet/i })).toBeInTheDocument();
  });

  test('handles successful bet placement', async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ balance: 1000 }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Bet placed successfully!' }),
        })
      );

    render(<PlaceBet />);

    // Wait for the balance to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 1000 PTK/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Lichess Game ID/i), {
      target: { value: 'abc123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), {
      target: { value: '100' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Place Bet/i }));

    await waitFor(() => {
      expect(screen.getByText(/Bet placed successfully!/i)).toBeInTheDocument();
    });

    // Optionally, verify that the balance has been updated
    expect(screen.getByText(/Your Balance: 900 PTK/i)).toBeInTheDocument();
  });

  test('handles bet placement error', async () => {
    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ balance: 1000 }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Insufficient balance' }),
        })
      );

    render(<PlaceBet />);

    // Wait for the balance to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 1000 PTK/i)).toBeInTheDocument();
    });

    // Provide valid inputs to enable the "Place Bet" button
    fireEvent.change(screen.getByPlaceholderText(/Lichess Game ID/i), {
      target: { value: 'abc123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), {
      target: { value: '1500' }, // Assuming 1500 > 1000 to trigger the error
    });

    // Ensure the "Place Bet" button is enabled
    const placeBetButton = screen.getByRole('button', { name: /Place Bet/i });
    expect(placeBetButton).not.toBeDisabled();

    fireEvent.click(placeBetButton);

    await waitFor(() => {
      expect(screen.getByText(/Error: Insufficient balance/i)).toBeInTheDocument();
    });
  });
});

