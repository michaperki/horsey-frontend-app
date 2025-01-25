// src/components/Navbar.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useSelectedToken } from '../contexts/SelectedTokenContext';
import Navbar from './Navbar';

// Mock the context hooks
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../contexts/TokenContext', () => ({
  useToken: jest.fn(),
}));

jest.mock('../contexts/NotificationsContext', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('../contexts/SelectedTokenContext', () => ({
  useSelectedToken: jest.fn(),
}));

// Mock useNavigate from react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Helper function to mock useToken
const mockUseTokenHook = (tokenBalance = 1000, sweepstakesBalance = 500) => {
  useToken.mockReturnValue({
    tokenBalance,
    sweepstakesBalance,
    loading: false,
    error: null,
    fetchBalances: jest.fn(),
    updateTokenBalance: jest.fn(),
    updateSweepstakesBalance: jest.fn(),
  });
};

// Helper function to mock useNotifications
const mockUseNotificationsHook = (unreadCount = 0) => {
  useNotifications.mockReturnValue({
    unreadCount,
    notifications: [],
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    loading: false,
  });
};

// Helper function to mock useSelectedToken
const mockUseSelectedTokenHook = (selectedToken = 'token', updateSelectedToken = jest.fn()) => {
  useSelectedToken.mockReturnValue({
    selectedToken,
    updateSelectedToken,
  });
};

describe('Navbar', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock global.fetch for Lichess connection status
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ connected: false }),
      })
    );
  });

  afterEach(() => {
    // Restore global fetch
    global.fetch.mockRestore();
  });

  it('renders the basic links for unauthenticated users', () => {
    // Setup mocks for unauthenticated user
    useAuth.mockReturnValue({ token: null, user: null, logout: jest.fn() });
    mockUseTokenHook(); // Provide default mock values
    mockUseNotificationsHook(); // Provide default mock notifications
    mockUseSelectedTokenHook(); // Provide default selectedToken

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Check for Logo (assuming 'Horsey' text)
    expect(screen.getByText(/Horsey/i)).toBeInTheDocument();

    // Check for Login and Register buttons by aria-label
    expect(screen.getByLabelText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Register/i)).toBeInTheDocument();

    // Since user is not authenticated, "Home", "Lobby", etc. should not be present
    expect(screen.queryByLabelText(/Home/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Lobby/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Admin Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Store/i)).not.toBeInTheDocument();
  });

  it('renders user links when a user is logged in', async () => {
    // Setup mocks for authenticated user
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: jest.fn(),
    });
    mockUseTokenHook(1000, 500);
    mockUseNotificationsHook(2);
    mockUseSelectedTokenHook(); // Provide default selectedToken

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Check for Logo
    expect(screen.getByText(/Horsey/i)).toBeInTheDocument();

    // Check for user-specific links
    expect(screen.getByLabelText(/Home/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lobby/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Leaderboards/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Store/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notifications/i)).toBeInTheDocument();

    // Check for "Connect Lichess" button
    expect(screen.getByLabelText(/Connect Lichess/i)).toBeInTheDocument();

    // Check for user avatar
    expect(screen.getByAltText(/User Avatar/i)).toBeInTheDocument();

    // Check for unread notifications badge
    expect(screen.getByText('2')).toBeInTheDocument();

    // Ensure admin links are not present
    expect(screen.queryByLabelText(/Admin Dashboard/i)).not.toBeInTheDocument();
  });

  it('renders admin links when an admin is logged in', () => {
    // Setup mocks for admin user
    useAuth.mockReturnValue({
      token: 'adminToken',
      user: { role: 'admin', avatar: 'admin-avatar.png' },
      logout: jest.fn(),
    });
    mockUseTokenHook(2000, 1000);
    mockUseNotificationsHook(0);
    mockUseSelectedTokenHook(); // Provide default selectedToken

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Check for Logo
    expect(screen.getByText(/Horsey/i)).toBeInTheDocument();

    // Check for Admin Dashboard link
    expect(screen.getByLabelText(/Admin Dashboard/i)).toBeInTheDocument();

    // Open the user dropdown to check for Logout
    const userAvatar = screen.getByAltText(/User Avatar/i);
    fireEvent.click(userAvatar);

    // Check for "Logout" button
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();

    // Ensure user-specific links are not present
    expect(screen.queryByLabelText(/Home/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Lobby/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Leaderboards/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Store/i)).not.toBeInTheDocument();
  });

  it('calls logout when the logout button is clicked', () => {
    const mockLogout = jest.fn();
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: mockLogout,
    });
    mockUseTokenHook(1000, 500);
    mockUseNotificationsHook(1);
    mockUseSelectedTokenHook(); // Provide default selectedToken

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Open the user dropdown
    const userAvatar = screen.getByAltText(/User Avatar/i);
    fireEvent.click(userAvatar);

    // Click on Logout button
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders the Lichess connection status correctly', async () => {
    // Mock fetch to return connected: true
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ connected: true }),
      })
    );

    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: jest.fn(),
    });
    mockUseTokenHook(1000, 500);
    mockUseNotificationsHook(0);
    mockUseSelectedTokenHook(); // Provide default selectedToken

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Wait for the fetch to complete and the component to update
    await waitFor(() => {
      // Since Lichess is connected, "Connect Lichess" button should not be present
      expect(screen.queryByLabelText(/Connect Lichess/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading spinner when Lichess connection is in progress', async () => {
    // Mock fetch to take time
    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ connected: false }),
            });
          }, 100);
        })
    );

    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: jest.fn(),
    });
    mockUseTokenHook(1000, 500);
    mockUseNotificationsHook(0);
    mockUseSelectedTokenHook(); // Provide default selectedToken

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Initially, loading spinner should be present on "Connect Lichess" button
    const connectButton = screen.getByLabelText(/Connect Lichess/i);
    expect(connectButton).toBeDisabled();
    expect(screen.getByLabelText(/Connecting/i)).toBeInTheDocument();

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(connectButton).not.toBeDisabled();
      expect(screen.queryByLabelText(/Connecting/i)).not.toBeInTheDocument();
    });
  });

  it('displays error message when data fails to load', async () => {
    // Mock fetch to fail
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    const mockLogout = jest.fn();
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: mockLogout,
    });
    mockUseTokenHook(1000, 500);
    mockUseNotificationsHook(0);
    mockUseSelectedTokenHook(); // Provide default selectedToken

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Wait for the fetch to complete and error to be set
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data. Please try again.');
    });
  });
});
