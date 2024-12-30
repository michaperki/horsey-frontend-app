import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourBets from './YourBets';
import { getUserBets } from '../services/api';

// Mock the getUserBets function
jest.mock('../services/api', () => ({
  getUserBets: jest.fn(),
}));

describe('YourBets Component', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  test('shows login message when not logged in', () => {
    // Mock no token in localStorage
    window.localStorage.getItem.mockReturnValue(null);
    
    render(<YourBets />);
    expect(screen.getByText('Please log in to view your bets.')).toBeInTheDocument();
    expect(getUserBets).not.toHaveBeenCalled();
  });

  test('renders bets data when logged in', async () => {
    // Mock token in localStorage
    window.localStorage.getItem.mockReturnValue('valid-token');

    // Mock API response
    const mockBetsData = {
      bets: [
        {
          _id: 'bet1',
          gameId: 'game123',
          creatorColor: 'white',
          finalWhiteId: { username: 'User1' },
          finalBlackId: { username: 'User2' },
          amount: 100,
          status: 'active',
          createdAt: '2024-01-01T12:00:00Z',
        },
      ],
      totalPages: 1,
    };

    getUserBets.mockResolvedValueOnce(mockBetsData);

    // Render component
    render(<YourBets />);

    // Wait for the API call
    await waitFor(() => {
      expect(getUserBets).toHaveBeenCalledWith('valid-token', {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
      });
    });

    // Verify content once data is loaded
    const dateCell = await screen.findByTestId('bet-date');
    expect(dateCell).toBeInTheDocument();
  });
});
