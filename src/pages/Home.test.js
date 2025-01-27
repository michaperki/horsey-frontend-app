
// src/pages/Home.test.js

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '../utils/test-utils'; // Use custom render from test-utils.js
import Home from './Home';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';
import { useLichess } from '../contexts/LichessContext';
import { getUserProfile, createNotification, getLichessStatus } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Partial mock of AuthContext
jest.mock('../contexts/AuthContext', () => {
  const actual = jest.requireActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: jest.fn(),
  };
});

// Partial mock of TokenContext
jest.mock('../contexts/TokenContext', () => {
  const actual = jest.requireActual('../contexts/TokenContext');
  return {
    ...actual,
    useToken: jest.fn(),
  };
});

// Partial mock of LichessContext
jest.mock('../contexts/LichessContext', () => {
  const actual = jest.requireActual('../contexts/LichessContext');
  return {
    ...actual,
    useLichess: jest.fn(),
  };
});

// Mock the API functions including getLichessStatus
jest.mock('../services/api', () => ({
  getUserProfile: jest.fn(),
  createNotification: jest.fn(),
  getLichessStatus: jest.fn(), // Added this line
}));

// Mock useNavigate from react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Home Component', () => {
  const mockedUseAuthHook = useAuth;
  const mockedUseTokenHook = useToken;
  const mockedUseLichessHook = useLichess;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock global fetch
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.endsWith('/lichess/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ connected: true }),
        });
      }

      if (url.endsWith('/balances')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tokenBalance: 100,
              sweepstakesBalance: 50,
            }),
        });
      }

      // Add more endpoints as needed
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Mock getLichessStatus to return connected status
    getLichessStatus.mockResolvedValue(true);
  });

  afterEach(() => {
    // Restore fetch after each test
    global.fetch.mockRestore();
  });

  it('renders stats and PlaceBet when user is authenticated and Lichess is connected', async () => {
    // Mock authentication and token balance
    mockedUseAuthHook.mockReturnValue({ token: 'fake-token' });
    mockedUseTokenHook.mockReturnValue({ tokenBalance: 100, sweepstakesBalance: 50 });

    // Mock Lichess context
    mockedUseLichessHook.mockReturnValue({
      lichessConnected: true,
      lichessUsername: 'TestUser',
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    // Mock API response
    getUserProfile.mockResolvedValue({
      statistics: {
        totalGames: 10,
        averageWager: 20,
        totalWagered: 200,
        averageROI: '10.00',
        totalWinnings: 100,
        totalLosses: 100,
        karma: 5,
        membership: 'Free',
      },
      username: 'TestUser',
    });

    render(<Home />);

    // Wait for the stats to be rendered
    expect(await screen.findByText(/Total Games Played/i)).toBeInTheDocument();

    // Use 'within' to scope queries to specific stat cards
    const totalGamesCard = screen.getByText(/Total Games Played/i).closest('.stat-card');
    expect(within(totalGamesCard).getByText('10')).toBeInTheDocument();

    const averageWagerCard = screen.getByText(/Average Wager/i).closest('.stat-card');
    expect(within(averageWagerCard).getByText(/20 PTK/)).toBeInTheDocument();

    const totalWageredCard = screen.getByText(/Total Wagered/i).closest('.stat-card');
    expect(within(totalWageredCard).getByText(/200 PTK/)).toBeInTheDocument();

    const averageROICard = screen.getByText(/Average ROI/i).closest('.stat-card');
    expect(within(averageROICard).getByText(/10.00%/)).toBeInTheDocument();

    const totalWinningsCard = screen.getByText(/Total Winnings/i).closest('.stat-card');
    expect(within(totalWinningsCard).getByText(/100 PTK/)).toBeInTheDocument();

    const totalLossesCard = screen.getByText(/Total Losses/i).closest('.stat-card');
    expect(within(totalLossesCard).getByText(/100 PTK/)).toBeInTheDocument();

    // Verify Karma
    expect(screen.getByText(/Karma: 5/i)).toBeInTheDocument();

    // Verify PlaceBet functionality
    expect(screen.getByText(/Classic Blitz/i)).toBeInTheDocument();
    expect(screen.getByText(/Chess 960/i)).toBeInTheDocument();
    expect(screen.getByText(/Play for Horsey Coins/i)).toBeInTheDocument();
  });

  it('handles membership button click', async () => {
    // Mock authentication and token balance
    mockedUseAuthHook.mockReturnValue({ token: 'fake-token' });
    mockedUseTokenHook.mockReturnValue({ tokenBalance: 100, sweepstakesBalance: 50 });

    // Mock Lichess context
    mockedUseLichessHook.mockReturnValue({
      lichessConnected: true,
      lichessUsername: 'TestUser',
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    // Mock API response
    getUserProfile.mockResolvedValue({
      statistics: {
        totalGames: 10,
        averageWager: 20,
        totalWagered: 200,
        averageROI: '10.00',
        totalWinnings: 100,
        totalLosses: 100,
        karma: 5,
        membership: 'Free',
      },
      username: 'TestUser',
    });

    // Mock createNotification API call
    createNotification.mockResolvedValue({ success: true });

    render(<Home />);

    // Wait for the stats to be rendered
    expect(await screen.findByText(/Total Games Played/i)).toBeInTheDocument();

    // Find the "Get Coins" button
    const getCoinsButton = screen.getByRole('button', { name: /Get Coins/i });
    expect(getCoinsButton).toBeInTheDocument();

    // Click the "Get Coins" button
    fireEvent.click(getCoinsButton);

    // Ensure navigate was called with '/store'
    expect(mockedNavigate).toHaveBeenCalledWith('/store');
  });

  it('opens PlaceBetModal when a game mode is clicked and Lichess is connected', async () => {
    // Mock authentication and token balance
    mockedUseAuthHook.mockReturnValue({ token: 'fake-token' });
    mockedUseTokenHook.mockReturnValue({ tokenBalance: 100, sweepstakesBalance: 50 });

    // Mock Lichess context
    mockedUseLichessHook.mockReturnValue({
      lichessConnected: true,
      lichessUsername: 'TestUser',
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    // Mock API response
    getUserProfile.mockResolvedValue({
      statistics: {
        totalGames: 10,
        averageWager: 20,
        totalWagered: 200,
        averageROI: '10.00',
        totalWinnings: 100,
        totalLosses: 100,
        karma: 5,
        membership: 'Free',
      },
      username: 'TestUser',
    });

    render(<Home />);

    // Wait for the stats to be rendered
    expect(await screen.findByText(/Total Games Played/i)).toBeInTheDocument();

    // Click on "Classic Blitz" card
    const classicBlitzCard = screen.getByText(/Classic Blitz/i).closest('.clickable-card');
    expect(classicBlitzCard).toBeInTheDocument();
    fireEvent.click(classicBlitzCard);

    // Verify that PlaceBetModal is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByLabelText(/Close Modal/i);
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('triggers shake animation and shows notification when Lichess is not connected', async () => {
    // Mock authentication and token balance
    mockedUseAuthHook.mockReturnValue({ token: 'fake-token' });
    mockedUseTokenHook.mockReturnValue({ tokenBalance: 100, sweepstakesBalance: 50 });

    // Mock Lichess context with lichessConnected as false
    const mockTriggerShake = jest.fn();
    mockedUseLichessHook.mockReturnValue({
      lichessConnected: false,
      triggerShake: mockTriggerShake,
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    // Mock API response
    getUserProfile.mockResolvedValue({
      statistics: {
        totalGames: 10,
        averageWager: 20,
        totalWagered: 200,
        averageROI: '10.00',
        totalWinnings: 100,
        totalLosses: 100,
        karma: 5,
        membership: 'Free',
      },
      username: 'TestUser',
    });

    render(<Home />);

    // Wait for the stats to be rendered
    expect(await screen.findByText(/Total Games Played/i)).toBeInTheDocument();

    // Click on "Classic Blitz" card
    const classicBlitzCard = screen.getByText(/Classic Blitz/i).closest('.clickable-card');
    expect(classicBlitzCard).toBeInTheDocument();
    fireEvent.click(classicBlitzCard);

    // Since Lichess is not connected, PlaceBetModal should not open
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Ensure shake is triggered and notification is created
    expect(mockTriggerShake).toHaveBeenCalledTimes(1);
    expect(createNotification).toHaveBeenCalledWith({
      message: 'Please connect your Lichess account before placing a bet.',
      type: 'warning',
    });
  });
});

