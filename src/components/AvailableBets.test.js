// src/components/AvailableBets.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AvailableBets from './AvailableBets';
import { MemoryRouter } from 'react-router-dom';

describe('AvailableBets Component', () => {
  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
  });

  test('renders loading state initially', async () => {
    localStorage.setItem('token', 'fake-token');
    fetch.mockResponseOnce(JSON.stringify([])); // Mock as empty array

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading available bets.../i)).toBeInTheDocument();
    // Await to ensure no act(...) warnings
    await waitFor(() => {});
  });

  test('renders error message if fetching fails', async () => {
    localStorage.setItem('token', 'fake-token');
    fetch.mockRejectOnce(new Error('Network Error'));

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
    });
  });

  test('renders no bets message when there are no available bets', async () => {
    localStorage.setItem('token', 'fake-token');
    fetch.mockResponseOnce(JSON.stringify([])); // Mock as empty array

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No available bets at the moment./i)).toBeInTheDocument();
    });
  });

  test('renders list of available bets', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockBets = [
      {
        _id: 'bet1',
        gameId: 'game123',
        choice: 'white',
        amount: 100,
        status: 'pending',
      },
      {
        _id: 'bet2',
        gameId: 'game124',
        choice: 'black',
        amount: 150,
        status: 'pending',
      },
    ];
    fetch.mockResponseOnce(JSON.stringify(mockBets)); // Mock as array

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Check for each bet's gameId, choice, amount
      mockBets.forEach((bet) => {
        expect(screen.getByText(new RegExp(bet.gameId, 'i'))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(bet.choice, 'i'))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(bet.amount.toString(), 'i'))).toBeInTheDocument();
      });

      // Check that the number of 'pending' statuses matches the number of bets
      const pendingElements = screen.getAllByText(/pending/i);
      expect(pendingElements).toHaveLength(mockBets.length);
    });
  });

  test('handles accepting a bet successfully', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockBets = [
      {
        _id: 'bet1',
        gameId: 'game123',
        choice: 'white',
        amount: 100,
        status: 'pending',
      },
    ];
    fetch
      .mockResponseOnce(JSON.stringify(mockBets)) // Initial fetch
      .mockResponseOnce(JSON.stringify({ message: 'Successfully joined the bet!' })); // Accept bet

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    // Wait for bets to load
    await waitFor(() => {
      expect(screen.getByText(/game123/i)).toBeInTheDocument();
      expect(screen.getByText(/white/i)).toBeInTheDocument();
      expect(screen.getByText(/100/i)).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    // Click on "Join Bet" button
    const joinButton = screen.getByRole('button', { name: /Join Bet/i });
    fireEvent.click(joinButton);

    // Button should show "Joining..."
    expect(screen.getByRole('button', { name: /Joining.../i })).toBeInTheDocument();

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully joined the bet!/i)).toBeInTheDocument();
    });

    // The bet should be removed from the list
    expect(screen.queryByText(/game123/i)).not.toBeInTheDocument();
  });

  test('handles accepting a bet failure', async () => {
    localStorage.setItem('token', 'fake-token');
    const mockBets = [
      {
        _id: 'bet1',
        gameId: 'game123',
        choice: 'white',
        amount: 100,
        status: 'pending',
      },
    ];
    fetch
      .mockResponseOnce(JSON.stringify(mockBets)) // Initial fetch
      .mockResponseOnce(JSON.stringify({ error: 'Insufficient balance' }), { status: 400 }); // Accept bet fails

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    // Wait for bets to load
    await waitFor(() => {
      expect(screen.getByText(/game123/i)).toBeInTheDocument();
      expect(screen.getByText(/white/i)).toBeInTheDocument();
      expect(screen.getByText(/100/i)).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    // Click on "Join Bet" button
    const joinButton = screen.getByRole('button', { name: /Join Bet/i });
    fireEvent.click(joinButton);

    // Button should show "Joining..."
    expect(screen.getByRole('button', { name: /Joining.../i })).toBeInTheDocument();

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
    });

    // The bet should still be in the list
    expect(screen.getByText(/game123/i)).toBeInTheDocument();
  });

  test('displays error if user is not authenticated', async () => {
    // No token set
    fetch.mockResponseOnce(JSON.stringify({ error: 'Access denied' }), { status: 401 });

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Please log in to view available bets./i)).toBeInTheDocument();
    });
  });
});
