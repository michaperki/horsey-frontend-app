
// src/components/AvailableBets.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import AvailableBets from './AvailableBets';
import { MemoryRouter } from 'react-router-dom';

describe('AvailableBets Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    fetch.resetMocks();
    localStorage.clear();
  });

  test('renders loading state initially', async () => {
    // Set up localStorage with a fake token
    localStorage.setItem('token', 'fake-token');

    // Mock fetch response with an empty array
    fetch.mockResponseOnce(JSON.stringify([]));

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    // Check for the loading message
    expect(screen.getByText(/Loading available bets.../i)).toBeInTheDocument();

    // Ensure fetch was called once
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  test('renders error message if fetching fails', async () => {
    // Spy on console.error to suppress error logs during tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set up localStorage with a fake token
    localStorage.setItem('token', 'fake-token');

    // Mock fetch to reject with a network error
    fetch.mockRejectOnce(new Error('Network Error'));

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
    });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('renders no bets message when there are no available bets', async () => {
    // Set up localStorage with a fake token
    localStorage.setItem('token', 'fake-token');

    // Mock fetch response with an empty array
    fetch.mockResponseOnce(JSON.stringify([]));

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    // Wait for the "No available bets" message to appear
    await waitFor(() => {
      expect(screen.getByText(/No available bets at the moment./i)).toBeInTheDocument();
    });
  });

  test('renders list of available bets', async () => {
    // Set up localStorage with a fake token
    localStorage.setItem('token', 'fake-token');

    // Define mock bets data
    const mockBets = [
      {
        id: '6769a1afb472b8dec9c23d4a',
        creator: 'user1@example.com',
        creatorBalance: 1000,
        wager: 50,
        gameType: 'Standard',
        createdAt: '2024-12-24T04:24:30.893Z',
      },
      {
        id: '676a377e0bf389fce3b5adce',
        creator: 'user2@example.com',
        creatorBalance: 900,
        wager: 100,
        gameType: 'Standard',
        createdAt: '2024-12-24T05:00:00.000Z',
      },
    ];

    // Mock fetch with the mockBets data
    fetch.mockResponseOnce(JSON.stringify(mockBets));

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    // Wait for the bets to be rendered
    await waitFor(() => {
      // Get all table rows (including the header)
      const rows = screen.getAllByRole('row');
      // Expect the number of rows to be header + number of bets
      expect(rows).toHaveLength(mockBets.length + 1);

      // Iterate through each bet and verify its data within the corresponding row
      mockBets.forEach((bet) => {
        // Find the row containing the bet's ID
        const betIdCell = screen.getByText(bet.id);
        const row = betIdCell.closest('tr');
        expect(row).toBeInTheDocument();

        // Use `within` to scope queries to the current row
        const { getByText, getByRole } = within(row);

        // Check for creator
        expect(getByText(bet.creator)).toBeInTheDocument();
        // Check for creatorBalance
        expect(getByText(bet.creatorBalance.toString())).toBeInTheDocument();
        // Check for wager
        expect(getByText(bet.wager.toString())).toBeInTheDocument();
        // Check for gameType
        expect(getByText(bet.gameType)).toBeInTheDocument();
        // Check for formatted createdAt
        expect(getByText(new Date(bet.createdAt).toLocaleString())).toBeInTheDocument();
        // Check for the "Join Bet" button
        expect(getByRole('button', { name: /Join Bet/i })).toBeInTheDocument();
        // Check for the select element with default value 'random'
        const selectElement = within(row).getByTestId(`color-select-${bet.id}`);
        expect(selectElement.value).toBe('random');
      });

      // Additionally, verify that the number of "Standard" game types matches the number of bets
      const gameTypeElements = screen.getAllByText(/Standard/i);
      expect(gameTypeElements).toHaveLength(mockBets.length);
    });
  });

  test('handles accepting a bet successfully', async () => {
    // Set up localStorage with a fake token
    localStorage.setItem('token', 'fake-token');

    // Define mock bets data
    const mockBets = [
      {
        id: '6769a1afb472b8dec9c23d4a',
        creator: 'user1@example.com',
        creatorBalance: 1000,
        wager: 50,
        gameType: 'Standard',
        createdAt: '2024-12-24T04:24:30.893Z',
      },
    ];

    // Mock fetch for fetching available bets and accepting the bet
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
      expect(screen.getByText(/6769a1afb472b8dec9c23d4a/i)).toBeInTheDocument();
      expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/1000/i)).toBeInTheDocument();
      expect(screen.getByText(/50/i)).toBeInTheDocument();
      expect(screen.getByText(/Standard/i)).toBeInTheDocument();
      expect(screen.getByText(/Available/i)).toBeInTheDocument();
    });

    // Use findByTestId to wait for the select to have 'random' selected
    const colorSelect = await screen.findByTestId('color-select-6769a1afb472b8dec9c23d4a');
    expect(colorSelect.value).toBe('random'); // Verify initial value
    fireEvent.change(colorSelect, { target: { value: 'black' } });

    // Click on the "Join Bet" button
    const joinButton = screen.getByRole('button', { name: /Join Bet/i });
    fireEvent.click(joinButton);

    // Button should show "Joining..."
    expect(screen.getByRole('button', { name: /Joining.../i })).toBeInTheDocument();

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Successfully joined the bet!/i)).toBeInTheDocument();
    });

    // The bet should be removed from the list
    expect(screen.queryByText(/6769a1afb472b8dec9c23d4a/i)).not.toBeInTheDocument();
  });

  test('handles accepting a bet failure', async () => {
    // Spy on console.error to suppress error logs during tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set up localStorage with a fake token
    localStorage.setItem('token', 'fake-token');

    // Define mock bets data
    const mockBets = [
      {
        id: '6769a1afb472b8dec9c23d4a',
        creator: 'user1@example.com',
        creatorBalance: 1000,
        wager: 50,
        gameType: 'Standard',
        createdAt: '2024-12-24T04:24:30.893Z',
      },
    ];

    // Mock fetch for fetching available bets and accepting the bet with failure
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
      expect(screen.getByText(/6769a1afb472b8dec9c23d4a/i)).toBeInTheDocument();
      expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/1000/i)).toBeInTheDocument();
      expect(screen.getByText(/50/i)).toBeInTheDocument();
      expect(screen.getByText(/Standard/i)).toBeInTheDocument();
      expect(screen.getByText(/Available/i)).toBeInTheDocument();
    });

    // Use findByTestId to wait for the select to have 'random' selected
    const colorSelect = await screen.findByTestId('color-select-6769a1afb472b8dec9c23d4a');
    expect(colorSelect.value).toBe('random'); // Verify initial value
    fireEvent.change(colorSelect, { target: { value: 'black' } });

    // Click on the "Join Bet" button
    const joinButton = screen.getByRole('button', { name: /Join Bet/i });
    fireEvent.click(joinButton);

    // Button should show "Joining..."
    expect(screen.getByRole('button', { name: /Joining.../i })).toBeInTheDocument();

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
    });

    // The bet should still be in the list
    expect(screen.getByText(/6769a1afb472b8dec9c23d4a/i)).toBeInTheDocument();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('displays error if user is not authenticated', async () => {
    // Spy on console.error to suppress error logs during tests
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // No token set in localStorage

    // Mock fetch response with a 401 error
    fetch.mockResponseOnce(JSON.stringify({ error: 'Access denied' }), { status: 401 });

    render(
      <MemoryRouter>
        <AvailableBets />
      </MemoryRouter>
    );

    // Wait for the authentication error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Please log in to view available bets./i)).toBeInTheDocument();
    });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});

