
// src/pages/Home.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import * as AuthContextModule from '../contexts/AuthContext';
import * as TokenContextModule from '../contexts/TokenContext'; // Mock Token Context
import * as api from '../services/api';

// Mock the API functions
jest.mock('../services/api', () => ({
  getUserProfile: jest.fn(),
  createNotification: jest.fn(), // Mock createNotification as well
}));

// Mock the useAuth and useToken hooks
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../contexts/TokenContext', () => ({
  useToken: jest.fn(),
}));

describe('Home Component', () => {
  const mockedUseAuth = AuthContextModule.useAuth;
  const mockedUseToken = TokenContextModule.useToken;

  beforeEach(() => {
    api.getUserProfile.mockClear();
    api.createNotification.mockClear();
    mockedUseAuth.mockClear();
    mockedUseToken.mockClear();
    jest.clearAllMocks();
  });

  test('renders stats and PlaceBet when user is authenticated', async () => {
    // Mock authentication and token balance
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    mockedUseToken.mockReturnValue({ tokenBalance: 100, sweepstakesBalance: 50 });

    // Mock API response
    api.getUserProfile.mockResolvedValue({
      lichessUsername: 'TestUser',
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
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

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

  test('handles membership button click', async () => {
    // Mock authentication and token balance
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    mockedUseToken.mockReturnValue({ tokenBalance: 100, sweepstakesBalance: 50 });

    // Mock API response
    api.getUserProfile.mockResolvedValue({
      lichessUsername: 'TestUser',
      statistics: {
        membership: 'Free',
        karma: 5,
        totalGames: 10,
        averageWager: 20,
        totalWagered: 200,
        averageROI: '10.00',
        totalWinnings: 100,
        totalLosses: 100,
      },
    });

    // Mock createNotification API call
    api.createNotification.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for the loading to finish and the button to appear
    const membershipButton = await screen.findByRole('button', { name: /Become a Member/i });
    expect(membershipButton).toBeInTheDocument();

    // Click the membership button
    fireEvent.click(membershipButton);

    // Ensure the button shows 'Processing...' while loading
    expect(membershipButton).toHaveTextContent(/Processing.../i);
    expect(membershipButton).toBeDisabled();

    // Wait for the button to update back to "Become a Member"
    await waitFor(() => {
      expect(membershipButton).toHaveTextContent(/Become a Member/i);
      expect(membershipButton).not.toBeDisabled();
    });

    // Ensure the API call was made
    expect(api.createNotification).toHaveBeenCalledWith({
      message: 'Membership coming soon!',
      type: 'membership',
    });
  });
});

