import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvailableBets from './AvailableBets';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { useToken } from 'features/token/contexts/TokenContext';
import { useSelectedToken } from 'features/token/contexts/SelectedTokenContext';
import { acceptBet, getAvailableBets } from 'features/betting/services/api';

// Mock context hooks
jest.mock('features/auth/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('features/token/contexts/TokenContext', () => ({
  useToken: jest.fn(),
}));

jest.mock('features/token/contexts/SelectedTokenContext', () => ({
  useSelectedToken: jest.fn(),
}));

// Mock API calls
jest.mock('features/betting/services/api', () => ({
  acceptBet: jest.fn(),
  getAvailableBets: jest.fn(),
}));

describe('AvailableBets Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    jest.useFakeTimers('modern'); // Use modern fake timers
    jest.setSystemTime(new Date('2025-01-25T12:00:00Z')); // Set system time to a fixed date
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers after each test
  });

  test('renders Available Bets table with fetched data', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });

    // Mock token context
    useToken.mockReturnValue({
      tokenBalance: 500,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });

    // Mock selected token context
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

    // Mock API response with complete bet data
    const mockBets = [
      {
        id: 'bet1',
        creatorLichessUsername: 'User1',
        creator: 'User1',
        colorPreference: 'white',
        timeControl: '10|5',
        variant: 'standard',
        wager: 100,
        currencyType: 'token',
        createdAt: '2025-01-25T12:00:00Z', // Align with system time
        creatorRatings: {
          standard: { blitz: 1500 },
        },
      },
    ];
    getAvailableBets.mockResolvedValue(mockBets);

    render(<AvailableBets />);

    // Verify loading state
    expect(screen.getByText(/Loading available bets.../i)).toBeInTheDocument();

    // Wait for bets to load and verify content
    await waitFor(() => {
      // Check for creator's username
      expect(screen.getByText('User1')).toBeInTheDocument();

      // Check for wager
      expect(screen.getByText('100 TOKEN')).toBeInTheDocument();

      // Check for time control
      expect(screen.getByText('10+5')).toBeInTheDocument();

      // Check for time elapsed
      expect(screen.getByText(/less than a minute ago|just now/i)).toBeInTheDocument();
    });
  });

  test('handles no bets available gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });

    // Mock token context
    useToken.mockReturnValue({
      tokenBalance: 500,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });

    // Mock selected token context
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

    // Mock API response with no bets
    getAvailableBets.mockResolvedValue([]);

    render(<AvailableBets />);

    await waitFor(() => {
      expect(
        screen.getByText(/No bets are available right now./i)
      ).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });

    // Mock token context
    useToken.mockReturnValue({
      tokenBalance: 500,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });

    // Mock selected token context
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

    // Mock API failure
    getAvailableBets.mockRejectedValue(new Error('Failed to fetch bets'));

    render(<AvailableBets />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch bets/i)).toBeInTheDocument();
    });
  });

  test('displays message when user is not authenticated', () => {
    // Mock unauthenticated user
    useAuth.mockReturnValue({ token: null, user: null });

    // Mock token context (shouldn't matter as user is unauthenticated)
    useToken.mockReturnValue({
      tokenBalance: 0,
      sweepstakesBalance: 0,
      loading: false,
      error: null,
    });

    // Mock selected token context
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

    render(<AvailableBets />);

    expect(
      screen.getByText(/Please log in to view available bets./i)
    ).toBeInTheDocument();
  });

  test('filters bets based on token balance', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });

    // Mock token context with limited balance
    useToken.mockReturnValue({
      tokenBalance: 100,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });

    // Mock selected token context
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

    // Mock API response with multiple bets
    const mockBets = [
      {
        id: 'bet1',
        creatorLichessUsername: 'User1',
        creator: 'User1',
        colorPreference: 'white',
        timeControl: '10|5',
        variant: 'standard',
        wager: 50, // Within tokenBalance
        currencyType: 'token',
        createdAt: '2025-01-25T12:00:00Z', // Align with system time
        creatorRatings: {
          standard: { blitz: 1500 },
        },
      },
      {
        id: 'bet2',
        creatorLichessUsername: 'User2',
        creator: 'User2',
        colorPreference: 'black',
        timeControl: '15|10',
        variant: 'rapid',
        wager: 200, // Exceeds tokenBalance
        currencyType: 'token',
        createdAt: '2025-01-25T12:00:00Z', // Align with system time
        creatorRatings: {
          standard: { blitz: 1600 },
        },
      },
    ];
    getAvailableBets.mockResolvedValue(mockBets);

    render(<AvailableBets />);

    await waitFor(() => {
      // bet1 should be visible
      expect(screen.getByText('User1')).toBeInTheDocument();

      // bet2 should be filtered out due to insufficient token balance
      expect(screen.queryByText('User2')).not.toBeInTheDocument();
    });
  });

  test('allows accepting a bet', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });

    // Mock token context
    useToken.mockReturnValue({
      tokenBalance: 500,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });

    // Mock selected token context
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

    // Mock API response with one bet
    const mockBets = [
      {
        id: 'bet1',
        creatorLichessUsername: 'User1',
        creator: 'User1',
        colorPreference: 'random',
        timeControl: '10|5',
        variant: 'standard',
        wager: 100,
        currencyType: 'token',
        createdAt: '2025-01-25T12:00:00Z', // Align with system time
        creatorRatings: {
          standard: { blitz: 1500 },
        },
      },
    ];
    getAvailableBets.mockResolvedValue(mockBets);

    // Mock acceptBet API call
    acceptBet.mockResolvedValue();

    render(<AvailableBets />);

    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
    });

    // Fix: The button text is just "Join", not "Join Bet"
    fireEvent.click(screen.getByRole('button', { name: /Join/i }));

    await waitFor(() => {
      // Ensure acceptBet was called with correct arguments
      expect(acceptBet).toHaveBeenCalledWith('bet1', expect.any(String));

      // The bet should be removed from the list
      expect(screen.queryByText('User1')).not.toBeInTheDocument();
    });
  });
});