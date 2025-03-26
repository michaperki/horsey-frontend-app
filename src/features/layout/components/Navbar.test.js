// src/components/Navbar.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'; // Use custom render from test-utils.js
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useSelectedToken } from '../contexts/SelectedTokenContext';
import { useLichess } from '../contexts/LichessContext';

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

// Partial mock of NotificationsContext
jest.mock('../contexts/NotificationsContext', () => {
  const actual = jest.requireActual('../contexts/NotificationsContext');
  return {
    ...actual,
    useNotifications: jest.fn(),
  };
});

// Partial mock of SelectedTokenContext
jest.mock('../contexts/SelectedTokenContext', () => {
  const actual = jest.requireActual('../contexts/SelectedTokenContext');
  return {
    ...actual,
    useSelectedToken: jest.fn(),
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

// Mock useNavigate from react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the basic links for unauthenticated users', () => {
    // Setup mocks for unauthenticated user
    useAuth.mockReturnValue({ token: null, user: null, logout: jest.fn() });
    useToken.mockReturnValue({
      tokenBalance: 0,
      sweepstakesBalance: 0,
      loading: false,
      error: null,
      fetchBalances: jest.fn(),
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    useNotifications.mockReturnValue({
      unreadCount: 0,
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
      updateSelectedToken: jest.fn(),
    });
    useLichess.mockReturnValue({
      lichessConnected: false,
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    render(<Navbar />);

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

  it('renders user links when a user is logged in', () => {
    // Setup mocks for authenticated user
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: jest.fn(),
    });
    useToken.mockReturnValue({
      tokenBalance: 1000,
      sweepstakesBalance: 500,
      loading: false,
      error: null,
      fetchBalances: jest.fn(),
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    useNotifications.mockReturnValue({
      unreadCount: 2,
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
      updateSelectedToken: jest.fn(),
    });
    useLichess.mockReturnValue({
      lichessConnected: false,
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    render(<Navbar />);

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
    useToken.mockReturnValue({
      tokenBalance: 2000,
      sweepstakesBalance: 1000,
      loading: false,
      error: null,
      fetchBalances: jest.fn(),
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    useNotifications.mockReturnValue({
      unreadCount: 0,
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
      updateSelectedToken: jest.fn(),
    });
    useLichess.mockReturnValue({
      lichessConnected: false,
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    render(<Navbar />);

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
    useToken.mockReturnValue({
      tokenBalance: 1000,
      sweepstakesBalance: 500,
      loading: false,
      error: null,
      fetchBalances: jest.fn(),
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    useNotifications.mockReturnValue({
      unreadCount: 1,
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
      updateSelectedToken: jest.fn(),
    });
    useLichess.mockReturnValue({
      lichessConnected: false,
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    render(<Navbar />);

    // Open the user dropdown
    const userAvatar = screen.getByAltText(/User Avatar/i);
    fireEvent.click(userAvatar);

    // Click on Logout button
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  it('renders the Lichess connection status correctly when connected', async () => {
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: jest.fn(),
    });
    useToken.mockReturnValue({
      tokenBalance: 1000,
      sweepstakesBalance: 500,
      loading: false,
      error: null,
      fetchBalances: jest.fn(),
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    useNotifications.mockReturnValue({
      unreadCount: 0,
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
      updateSelectedToken: jest.fn(),
    });
    useLichess.mockReturnValue({
      lichessConnected: true, // Simulate connected state
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    render(<Navbar />);

    // Since Lichess is connected, "Connect Lichess" button should not be present
    expect(screen.queryByLabelText(/Connect Lichess/i)).not.toBeInTheDocument();
  });

  it('shows loading spinner and disables the button when Lichess connection is in progress', () => {
    // Setup mocks with loading: true
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: jest.fn(),
    });
    useToken.mockReturnValue({
      tokenBalance: 1000,
      sweepstakesBalance: 500,
      loading: false,
      error: null,
      fetchBalances: jest.fn(),
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    useNotifications.mockReturnValue({
      unreadCount: 0,
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
      updateSelectedToken: jest.fn(),
    });
    useLichess.mockReturnValue({
      lichessConnected: false,
      connectLichess: jest.fn(),
      loading: true, // Simulate loading state
      shake: false,
    });

    render(<Navbar />);

    const connectButton = screen.getByLabelText(/Connect Lichess/i);
    expect(connectButton).toBeDisabled();
    expect(screen.getByLabelText(/Connecting/i)).toBeInTheDocument();
  });

  it('does not show loading spinner and enables the button when Lichess connection is not in progress', () => {
    // Setup mocks with loading: false
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: jest.fn(),
    });
    useToken.mockReturnValue({
      tokenBalance: 1000,
      sweepstakesBalance: 500,
      loading: false,
      error: null,
      fetchBalances: jest.fn(),
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    useNotifications.mockReturnValue({
      unreadCount: 0,
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
      updateSelectedToken: jest.fn(),
    });
    useLichess.mockReturnValue({
      lichessConnected: false,
      connectLichess: jest.fn(),
      loading: false, // Simulate not loading
      shake: false,
    });

    render(<Navbar />);

    const connectButton = screen.getByLabelText(/Connect Lichess/i);
    expect(connectButton).not.toBeDisabled();
    expect(screen.queryByLabelText(/Connecting/i)).not.toBeInTheDocument();
  });

  it('displays error message when Lichess connection fails', async () => {
    // Mock connectLichess to reject
    const mockConnectLichess = jest.fn().mockRejectedValue(new Error('Connection failed'));
    useLichess.mockReturnValue({
      lichessConnected: false,
      connectLichess: mockConnectLichess,
      loading: false,
      shake: false,
    });

    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user', avatar: 'user-avatar.png' },
      logout: jest.fn(),
    });
    useToken.mockReturnValue({
      tokenBalance: 1000,
      sweepstakesBalance: 500,
      loading: false,
      error: null,
      fetchBalances: jest.fn(),
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    useNotifications.mockReturnValue({
      unreadCount: 0,
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      loading: false,
    });
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
      updateSelectedToken: jest.fn(),
    });

    render(<Navbar />);

    // Click on the "Connect Lichess" button
    const connectButton = screen.getByLabelText(/Connect Lichess/i);
    fireEvent.click(connectButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to connect to Lichess. Please try again.');
    });
  });
});
