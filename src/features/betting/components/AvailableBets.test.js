// src/features/betting/components/AvailableBets.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvailableBets from './AvailableBets';
import { ApiErrorProvider } from 'features/common/contexts/ApiErrorContext';
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

// Helper to wrap components with providers
const renderWithProviders = (ui) => {
  return render(<ApiErrorProvider>{ui}</ApiErrorProvider>);
};

describe('AvailableBets Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date('2025-01-25T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders Available Bets table with fetched data', async () => {
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });
    useToken.mockReturnValue({
      tokenBalance: 500,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

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
        createdAt: '2025-01-25T12:00:00Z',
        creatorRatings: {
          standard: { blitz: 1500 },
        },
      },
    ];
    getAvailableBets.mockResolvedValue(mockBets);

    renderWithProviders(<AvailableBets />);

    expect(screen.getByText(/Loading available bets.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('100 TOKEN')).toBeInTheDocument();
      expect(screen.getByText('10+5')).toBeInTheDocument();
      expect(screen.getByText(/less than a minute ago|just now/i)).toBeInTheDocument();
    });
  });

  test('handles no bets available gracefully', async () => {
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });
    useToken.mockReturnValue({
      tokenBalance: 500,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });
    getAvailableBets.mockResolvedValue([]);

    renderWithProviders(<AvailableBets />);

    await waitFor(() => {
      expect(screen.getByText(/No bets are available right now./i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });
    useToken.mockReturnValue({
      tokenBalance: 500,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });
    getAvailableBets.mockRejectedValue(new Error('Failed to fetch bets'));

    renderWithProviders(<AvailableBets />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch bets/i)).toBeInTheDocument();
    });
  });

  test('displays message when user is not authenticated', () => {
    useAuth.mockReturnValue({ token: null, user: null });
    useToken.mockReturnValue({
      tokenBalance: 0,
      sweepstakesBalance: 0,
      loading: false,
      error: null,
    });
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

    renderWithProviders(<AvailableBets />);

    expect(screen.getByText(/Please log in to view available bets./i)).toBeInTheDocument();
  });

  test('filters bets based on token balance', async () => {
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });
    useToken.mockReturnValue({
      tokenBalance: 100,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

    const mockBets = [
      {
        id: 'bet1',
        creatorLichessUsername: 'User1',
        creator: 'User1',
        colorPreference: 'white',
        timeControl: '10|5',
        variant: 'standard',
        wager: 50,
        currencyType: 'token',
        createdAt: '2025-01-25T12:00:00Z',
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
        wager: 200,
        currencyType: 'token',
        createdAt: '2025-01-25T12:00:00Z',
        creatorRatings: {
          standard: { blitz: 1600 },
        },
      },
    ];
    getAvailableBets.mockResolvedValue(mockBets);

    renderWithProviders(<AvailableBets />);

    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.queryByText('User2')).not.toBeInTheDocument();
    });
  });

  test('allows accepting a bet', async () => {
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
    });
    useToken.mockReturnValue({
      tokenBalance: 500,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
    });
    useSelectedToken.mockReturnValue({ selectedToken: 'token' });

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
        createdAt: '2025-01-25T12:00:00Z',
        creatorRatings: {
          standard: { blitz: 1500 },
        },
      },
    ];
    getAvailableBets.mockResolvedValue(mockBets);
    acceptBet.mockResolvedValue();

    renderWithProviders(<AvailableBets />);

    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Join/i }));

    await waitFor(() => {
      expect(acceptBet).toHaveBeenCalledWith('bet1', expect.any(String));
      expect(screen.queryByText('User1')).not.toBeInTheDocument();
    });
  });
});
